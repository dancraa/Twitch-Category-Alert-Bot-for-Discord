import axios from 'axios';
import fs from 'fs';

const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const GAME_NAME = process.env.TWITCH_GAME_NAME || "Password Not Valid";
const CACHE_FILE = 'notified.json';
const EXPIRATION_HOURS = 24;

// Helper function to pause the script so Discord doesn't block us
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function getTwitchToken() {
  try {
    const res = await axios.post(`https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`);
    return res.data.access_token;
  } catch (error) {
    console.error("Error getting Twitch token:", error.response?.data || error.message);
    process.exit(1);
  }
}

// Helper function to look up Game ID from Game Name
async function getGameId(token, gameName) {
  try {
    const res = await axios.get(`https://api.twitch.tv/helix/games?name=${encodeURIComponent(gameName)}`, {
      headers: {
        'Client-ID': CLIENT_ID,
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.data.data && res.data.data.length > 0) {
      return res.data.data[0].id;
    } else {
      console.error(`Game "${gameName}" not found on Twitch.`);
      process.exit(1);
    }
  } catch (error) {
    console.error("Error fetching game ID:", error.response?.data || error.message);
    process.exit(1);
  }
}

function loadNotified() {
  if (fs.existsSync(CACHE_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
      const now = new Date().getTime();
      const cleanedData = {};

      for (const [streamerId, info] of Object.entries(data)) {
        const timestamp = typeof info === 'object' ? info.timestamp : 0;
        const hoursElapsed = (now - timestamp) / (1000 * 60 * 60);

        if (hoursElapsed < EXPIRATION_HOURS) {
          cleanedData[streamerId] = info;
        }
      }
      return cleanedData;
    } catch (e) {
      return {};
    }
  }
  return {};
}

function saveNotified(data) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2));
}

async function checkStreams() {
  const token = await getTwitchToken();
  const notified = loadNotified();
  
  // Create the file immediately so GitHub always has something to save
  saveNotified(notified);
  
  // Step 1: Automatically fetch the Game ID using the Game Name
  console.log(`Looking up game ID for "${GAME_NAME}"...`);
  const gameId = await getGameId(token, GAME_NAME);
  console.log(`Found Game ID: ${gameId}`);

  try {
    const res = await axios.get(`https://api.twitch.tv/helix/streams?game_id=${gameId}&first=100`, {
      headers: {
        'Client-ID': CLIENT_ID,
        'Authorization': `Bearer ${token}`
      }
    });

    const streams = res.data.data;
    console.log(`Fetched ${streams.length} active streams from Twitch API.`);

    if (streams && streams.length > 0) {
      for (const stream of streams) {
        const streamerId = stream.user_id;
        const streamId = stream.id;

        if (notified[streamerId] && notified[streamerId].streamId === streamId) {
          continue;
        }

        console.log(`New broadcast found for ${stream.user_name}! Sending alert...`);
        
        try {
          await axios.post(WEBHOOK_URL, {
            content: `\n🚨 **${stream.user_name}** is live playing **${stream.game_name}**!`,
            embeds: [{
              title: `🔴 ${stream.user_name} is live!`,
              description: `${stream.user_name} is playing ${stream.game_name} live on Twitch.\n\nGo take a look:\nhttps://twitch.tv/${stream.user_name}`,
              url: `https://twitch.tv/${stream.user_name}`,
              color: 6570404,
              fields: [
                { name: "Streamer", value: stream.user_name, inline: true },
                { name: "Game", value: stream.game_name, inline: true },
                { name: "Viewers", value: stream.viewer_count.toString(), inline: true },
              ],
              image: {
                url: stream.thumbnail_url.replace("{width}", "1280").replace("{height}", "720"),
              },
              timestamp: new Date().toISOString(),
            }]
          });

          // Remember this stream and save immediately
          notified[streamerId] = {
            streamId: streamId,
            timestamp: new Date().getTime()
          };
          saveNotified(notified);

          // Wait 2 seconds before the next message
          await sleep(2000);

        } catch (discordError) {
          console.error(`Failed to notify for ${stream.user_name}. Stopping to avoid rate limit bans.`, discordError.response?.data || discordError.message);
          break; // Stop loop safely
        }
      }
    } else {
      console.log("No streams found.");
    }
  } catch (error) {
    console.error("Error querying the Twitch API:", error.response?.data || error.message);
  }
}

checkStreams();

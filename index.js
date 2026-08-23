import axios from 'axios';
import fs from 'fs';

const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const GAME_ID = process.env.TWITCH_GAME_ID;
const CACHE_FILE = 'notified.json';

async function getTwitchToken() {
  try {
    const res = await axios.post(`https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`);
    return res.data.access_token;
  } catch (error) {
    console.error("Error getting Twitch token:", error.response?.data || error.message);
    process.exit(1);
  }
}

function loadNotified() {
  if (fs.existsSync(CACHE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
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
  
  try {
    // Requesting up to 100 streams from the category
    const res = await axios.get(`https://api.twitch.tv/helix/streams?game_id=${GAME_ID}&first=100`, {
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

        // If we already sent an alert for this specific broadcast, skip it
        if (notified[streamerId] === streamId) {
          continue;
        }

        console.log(`New broadcast found for ${stream.user_name}! Sending alert...`);
        
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

        // Mark this stream ID as notified
        notified[streamerId] = streamId;
      }

      saveNotified(notified);
    } else {
      console.log("No streams found.");
    }
  } catch (error) {
    console.error("Error querying the Twitch API:", error.response?.data || error.message);
  }
}

checkStreams();

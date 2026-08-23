import axios from 'axios';

const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const GAME_ID = process.env.TWITCH_GAME_ID; // Numeric ID of the category/game

// Function to get a bearer token from Twitch OAuth
async function getTwitchToken() {
  try {
    const res = await axios.post(`https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`);
    return res.data.access_token;
  } catch (error) {
    console.error("Error getting Twitch token:", error.response?.data || error.message);
    process.exit(1);
  }
}

// Function to check active streams under the specified category
async function checkStreams() {
  const token = await getTwitchToken();
  
  try {
    // Query active streams filtering by game_id, fetching up to the 5 most recent ones
    const res = await axios.get(`https://api.twitch.tv/helix/streams?game_id=${GAME_ID}&first=5`, {
      headers: {
        'Client-ID': CLIENT_ID,
        'Authorization': `Bearer ${token}`
      }
    });

    const streams = res.data.data;

    if (streams && streams.length > 0) {
      for (const stream of streams) {
        const startedAt = new Date(stream.started_at);
        const now = new Date();
        const diffMinutes = (now - startedAt) / (1000 * 60);

        // If the stream started less than 6 minutes ago (matching the cron frequency)
        if (diffMinutes <= 6) {
          console.log(`New stream detected in category ${stream.game_name} by ${stream.user_name}!`);
          
          // Send the notification to Discord using a webhook
          await axios.post(WEBHOOK_URL, {
            content: `---------------------------------\n🚨 **${stream.user_name}** is live playing **${stream.game_name}**!`,
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
        }
      }
    } else {
      console.log("No recent streams found in this category.");
    }
  } catch (error) {
    console.error("Error querying the Twitch API:", error.response?.data || error.message);
  }
}

checkStreams();

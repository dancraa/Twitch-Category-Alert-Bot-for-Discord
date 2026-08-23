import axios from 'axios';

const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const STREAMER_NAME = process.env.STREAMER_NAME;
async function getTwitchToken() {
  try {
    const res = await axios.post(`https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`);
    return res.data.access_token;
  } catch (error) {
    console.error("Error obteniendo token de Twitch:", error.response?.data || error.message);
    process.exit(1);
  }
}

async function checkStream() {
  const token = await getTwitchToken();
  
  try {
    const res = await axios.get(`https://api.twitch.tv/helix/streams?user_login=${STREAMER_NAME}`, {
      headers: {
        'Client-ID': CLIENT_ID,
        'Authorization': `Bearer ${token}`
      }
    });

    const streams = res.data.data;

    if (streams && streams.length > 0) {
      const stream = streams[0];
      
      const startedAt = new Date(stream.started_at);
      const now = new Date();
      const diffMinutes = (now - startedAt) / (1000 * 60);

      if (diffMinutes <= 10) {
        console.log(`${STREAMER_NAME}'s starting! Sending to Discord...`);
        
        await axios.post(WEBHOOK_URL, {
          content: `---------------------------------\n🚨 **${stream.user_name}** is live on Twitch!`,
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
      } else {
        console.log("Streamer went live a while ago, ignore.");
      }
    } else {
      console.log(`${STREAMER_NAME} is offline.`);
    }
  } catch (error) {
    console.error("Error on Twitch's API:", error.response?.data || error.message);
  }
}

checkStream();

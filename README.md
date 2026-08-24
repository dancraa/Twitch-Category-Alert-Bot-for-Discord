# 🔴 Twitch Category Alert Bot for Discord

A lightweight, automated bot powered by GitHub Actions, Node.js, and an external cron trigger that monitors a specific Twitch category/game and instantly sends rich Discord webhook notifications whenever a new stream goes live.

## 🚀 Features
* **Zero Maintenance Costs**: Runs entirely for free using GitHub Actions and a free external scheduler.
* **Customizable Intervals**: Bypasses GitHub's delayed cron queue using a web dispatch mechanism for precise, on-time alerts at any frequency you choose.
* **Human-Friendly Category Tracking**: Monitors an entire game or category simply by entering its official Twitch name (e.g., "League of Legends" or "Just Chatting").
* **Duplicate Prevention**: Tracks previously notified broadcasts using a local cache to prevent spamming your Discord channel.
* **Rich Embeds**: Sends clean, detailed Discord cards featuring streamer info, viewer counts, and direct stream links.

## 🛠️ Setup Guide
1. **Fork or Clone** this repository.
2. Go to your repository **Settings > Secrets and variables > Actions** and add the following Repository Secrets:
   * `TWITCH_CLIENT_ID`: Your Twitch Developer Application Client ID.
   * `TWITCH_CLIENT_SECRET`: Your Twitch Developer Application Client Secret.
   * `DISCORD_WEBHOOK_URL`: Your Discord channel webhook URL.
   * `TWITCH_GAME_NAME`: The exact name of the Twitch category/game you want to monitor (e.g., "League of Legends").
3. Generate a GitHub **Personal Access Token (Classic)** with the `workflow` scope enabled.
4. Set up a free account on an external cron service (like [cron-job.org](https://cron-job.org)) to trigger your workflow at your preferred schedule by sending a **POST** request to the following API URL:

   `https://api.github.com/repos/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME/actions/workflows/check-stream.yml/dispatches`

   *(Note: Remember to replace `YOUR_GITHUB_USERNAME` and `YOUR_REPOSITORY_NAME` with your actual GitHub details).*

   Include the following **Request Headers**:
   * `Authorization`: `Bearer YOUR_GITHUB_TOKEN`
   * `Content-Type`: `application/json`
   * `User-Agent`: `cron-job-request`

   And the **Request Body** (Raw JSON):
   ```json
   {
     "ref": "main"
   }
   ```

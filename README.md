🔴 Twitch Category Alert Bot for Discord
A lightweight, automated bot powered by GitHub Actions, Node.js, and an external cron trigger that monitors a specific Twitch category/game and instantly sends rich Discord webhook notifications whenever a new stream goes live.

🚀 Features
- Zero Maintenance Costs: Runs entirely for free using GitHub Actions and a free external scheduler.
- 100% Reliable 5-Min Intervals: Bypasses GitHub's delayed cron queue using a web dispatch mechanism for real-time alerts.
- Category Tracking: Monitors an entire game/category (e.g., League of Legends) via its numeric Twitch Game ID.
- Duplicate Prevention: Tracks previously notified broadcasts using a local cache to prevent spamming your Discord channel.
- Rich Embeds: Sends clean, detailed Discord cards featuring streamer info, viewer counts, and direct stream links.

🛠️ Setup Guide
1. Fork or Clone this repository.

2. Go to your repository Settings > Secrets and variables > Actions and add the following Repository Secrets:
   - TWITCH_CLIENT_ID: Your Twitch Developer Application Client ID.
   - TWITCH_CLIENT_SECRET: Your Twitch Developer Application Client Secret.
   - DISCORD_WEBHOOK_URL: Your Discord channel webhook URL.
   - TWITCH_GAME_ID: The numeric Twitch category ID (e.g., 21779 for League of Legends).

3. Generate a GitHub Personal Access Token (Classic) with the `workflow` scope enabled.

4. Set up a free account on a cron service (like cron-job.org) to trigger your workflow every 5 minutes by sending a POST request to:
   https://github.com
   
   Include the following Request Headers:
   - Authorization: Bearer YOUR_GITHUB_TOKEN
   - Content-Type: application/json
   - User-Agent: cron-job-request
   
   And the Request Body:
   {"ref": "main"}

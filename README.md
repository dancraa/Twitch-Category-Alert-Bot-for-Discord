# 🔴 Twitch Category Alert Bot for Discord

A lightweight, automated bot powered by **GitHub Actions** and **Node.js** that monitors a specific Twitch category/game and instantly sends rich Discord webhook notifications whenever a new stream goes live.

## 🚀 Features
* **Zero Maintenance Costs:** Runs entirely for free on GitHub Actions cron schedules.
* **Category Tracking:** Monitors an entire game/category (e.g., League of Legends) via its numeric Twitch Game ID.
* **Duplicate Prevention:** Tracks previously notified broadcasts using a local cache to prevent spamming your Discord channel.
* **Rich Embeds:** Sends clean, detailed Discord cards featuring streamer info, viewer counts, and direct stream links.

## 🛠️ Setup Guide

1. **Fork or Clone** this repository.
2. Go to your repository **Settings > Secrets and variables > Actions** and add the following **Repository Secrets**:
   * `TWITCH_CLIENT_ID`: Your Twitch Developer Application Client ID.
   * `TWITCH_CLIENT_SECRET`: Your Twitch Developer Application Client Secret.
   * `DISCORD_WEBHOOK_URL`: Your Discord channel webhook URL.
   * `TWITCH_GAME_ID`: The numeric Twitch category ID (e.g., `21779` for League of Legends).

3. Enable **GitHub Actions** in your repository if prompted, and the workflow will automatically check for new streams every 5 minutes!

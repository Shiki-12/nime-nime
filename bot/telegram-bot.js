/**
 * ─── NimeNime Telegram Broadcast Bot ────────────────────────────────
 *
 * A standalone, persistent Telegram bot that:
 *   1. Polls the anime API every 5 minutes for new releases
 *   2. Broadcasts new episodes to the configured Telegram channel
 *   3. Accepts admin remote-control commands (/start_bot, /stop_bot, /status)
 *
 * Run with:  node bot/telegram-bot.js
 * PM2:       pm2 start bot/telegram-bot.js --name nimenime-bot
 */

const { Telegraf } = require("telegraf");
const fs = require("fs/promises");
const path = require("path");

// ─── Load environment variables ─────────────────────────────────────
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;
const OWNER_ID = process.env.OWNER_ID;

// Validate required env vars
if (!BOT_TOKEN || !CHANNEL_ID || !OWNER_ID) {
  console.error(
    "❌ Missing required environment variables.\n" +
      "   Required: TELEGRAM_BOT_TOKEN, TELEGRAM_CHANNEL_ID, OWNER_ID\n" +
      "   Please check your .env file."
  );
  process.exit(1);
}

// ─── Constants ──────────────────────────────────────────────────────
const API_BASE = "https://www.sankavollerei.com/anime/animasu";
const SITE_URL = "https://nime-nime.web.id";
const CACHE_FILE = path.join(__dirname, "cache.json");
const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

// Realistic browser headers to avoid WAF blocks
const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
  Referer: "https://www.google.com/",
  Connection: "keep-alive",
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "cross-site",
};

// ─── State ──────────────────────────────────────────────────────────
let isBroadcasting = true;

// ─── Cache Manager ──────────────────────────────────────────────────

/**
 * Read the last broadcasted anime slug from cache.
 * Returns null if the cache file doesn't exist or is corrupted.
 */
async function getLastSlug() {
  try {
    const raw = await fs.readFile(CACHE_FILE, "utf-8");
    const data = JSON.parse(raw);
    return data.lastSlug || null;
  } catch {
    // File doesn't exist or is corrupted
    return null;
  }
}

/**
 * Save the new slug to the cache file.
 */
async function setLastSlug(slug) {
  const data = {
    lastSlug: slug,
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(CACHE_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// ─── API Fetcher ────────────────────────────────────────────────────

/**
 * Fetch the latest anime list from the API.
 * Returns the parsed JSON response or null on failure.
 */
async function fetchLatestAnime() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

  try {
    const res = await fetch(`${API_BASE}/home?page=1`, {
      headers: BROWSER_HEADERS,
      signal: controller.signal,
    });

    if (!res.ok) {
      console.error(`⚠️  API returned ${res.status} ${res.statusText}`);
      return null;
    }

    const json = await res.json();
    return json;
  } catch (err) {
    if (err.name === "AbortError") {
      console.error("⚠️  API request timed out (15s)");
    } else {
      console.error("⚠️  API fetch error:", err.message);
    }
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Message Formatter ──────────────────────────────────────────────

/**
 * Format the broadcast message in HTML for Telegram.
 */
function formatBroadcastMessage(anime) {
  const title = escapeHtml(anime.title || "Unknown Title");
  const episode = escapeHtml(anime.episode || "???");

  return (
    `🚨 <b>NEW EPISODE RELEASED!</b> 🚨\n\n` +
    `🎬 <b>Title:</b> ${title}\n` +
    `📺 <b>Episode:</b> ${episode}\n` +
    `🌟 <b>Quality:</b> 1080p | Sub Indo 🇮🇩\n\n` +
    `<i>Watch the latest episode now only on NimeNime!</i> 👇`
  );
}

/**
 * Escape HTML special characters for Telegram's HTML parse mode.
 */
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ─── Broadcast Engine ───────────────────────────────────────────────

/**
 * The core polling function. Checks for new anime releases and
 * broadcasts them to the Telegram channel.
 */
async function processBroadcast(bot) {
  // Kill-switch check
  if (!isBroadcasting) return;

  console.log(`🔄 [${new Date().toLocaleTimeString()}] Polling for new releases...`);

  // Fetch latest anime
  const data = await fetchLatestAnime();
  if (!data) {
    console.log("   ↳ Skipped: API returned no data.");
    return;
  }

  // Combine ongoing + recent arrays (same as the Next.js getHomeAnime)
  const animes = [...(data.ongoing || []), ...(data.recent || [])];
  if (animes.length === 0) {
    console.log("   ↳ Skipped: No anime entries found.");
    return;
  }

  const topAnime = animes[0];
  const currentSlug = topAnime.slug;

  // Get last cached slug
  const lastSlug = await getLastSlug();

  // First-run handling: seed cache without broadcasting
  if (lastSlug === null) {
    console.log(`   ↳ First run detected. Seeding cache with: "${currentSlug}"`);
    await setLastSlug(currentSlug);
    return;
  }

  // Diff check
  if (currentSlug === lastSlug) {
    console.log(`   ↳ No new releases. Current: "${currentSlug}"`);
    return;
  }

  // ── New release detected! Broadcast it. ───────────────────────
  console.log(`   🆕 New release detected! "${currentSlug}" (was: "${lastSlug}")`);

  const caption = formatBroadcastMessage(topAnime);
  const watchUrl = `${SITE_URL}/anime/${currentSlug}`;

  try {
    // Send photo with caption and inline keyboard
    if (topAnime.poster) {
      await bot.telegram.sendPhoto(CHANNEL_ID, topAnime.poster, {
        caption,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🎬 Watch Now on NimeNime",
                url: watchUrl,
              },
            ],
          ],
        },
      });
    } else {
      // Fallback: send message without photo
      await bot.telegram.sendMessage(CHANNEL_ID, caption, {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🎬 Watch Now on NimeNime",
                url: watchUrl,
              },
            ],
          ],
        },
      });
    }

    console.log(`   ✅ Broadcast sent successfully!`);

    // Update cache
    await setLastSlug(currentSlug);
  } catch (err) {
    console.error(`   ❌ Failed to send broadcast:`, err.message);
  }
}

// ─── Admin Guard ────────────────────────────────────────────────────

/**
 * Middleware guard: only allows the bot owner to use commands.
 * Returns true if authorized, false otherwise.
 */
function isOwner(ctx) {
  return ctx.from && ctx.from.id.toString() === OWNER_ID;
}

// ─── Bot Initialization ─────────────────────────────────────────────

const bot = new Telegraf(BOT_TOKEN);

// ── Admin Commands ──────────────────────────────────────────────────

bot.command("start_bot", async (ctx) => {
  if (!isOwner(ctx)) {
    return ctx.reply("🚫 Unauthorized. This bot is owner-only.");
  }

  isBroadcasting = true;
  console.log(`🟢 [Admin] Broadcast engine started by owner.`);
  return ctx.reply(
    "✅ <b>Broadcast engine started.</b>\nPolling is now active. New releases will be broadcasted automatically.",
    { parse_mode: "HTML" }
  );
});

bot.command("stop_bot", async (ctx) => {
  if (!isOwner(ctx)) {
    return ctx.reply("🚫 Unauthorized. This bot is owner-only.");
  }

  isBroadcasting = false;
  console.log(`🔴 [Admin] Broadcast engine stopped by owner.`);
  return ctx.reply(
    "🛑 <b>Broadcast engine stopped.</b>\nThe bot is sleeping. No broadcasts will be sent until you start it again.",
    { parse_mode: "HTML" }
  );
});

bot.command("status", async (ctx) => {
  if (!isOwner(ctx)) {
    return ctx.reply("🚫 Unauthorized. This bot is owner-only.");
  }

  const lastSlug = await getLastSlug();
  const status = isBroadcasting ? "🟢 Active" : "🔴 Stopped";
  const slugDisplay = lastSlug || "N/A (first run pending)";

  return ctx.reply(
    `📊 <b>Bot Status Report</b>\n\n` +
      `<b>Engine:</b> ${status}\n` +
      `<b>Last Slug:</b> <code>${escapeHtml(slugDisplay)}</code>\n` +
      `<b>Poll Interval:</b> Every 5 minutes\n` +
      `<b>Channel:</b> <code>${escapeHtml(CHANNEL_ID)}</code>\n` +
      `<b>Uptime Since:</b> <code>${startTime.toISOString()}</code>`,
    { parse_mode: "HTML" }
  );
});

// Default /start command (for non-owner users)
bot.start((ctx) => {
  if (isOwner(ctx)) {
    return ctx.reply(
      "👋 <b>Welcome, Admin!</b>\n\n" +
        "Available commands:\n" +
        "  /start_bot — Start the broadcast engine\n" +
        "  /stop_bot — Stop the broadcast engine\n" +
        "  /status — Check engine status\n",
      { parse_mode: "HTML" }
    );
  }
  return ctx.reply(
    "👋 Hi! I'm the NimeNime Broadcast Bot.\nI notify our channel about new anime releases.\n\nJoin @nimenime_id for updates!"
  );
});

// ─── Launch ─────────────────────────────────────────────────────────

const startTime = new Date();

async function main() {
  console.log("┌─────────────────────────────────────────────┐");
  console.log("│   🤖 NimeNime Telegram Broadcast Bot        │");
  console.log("├─────────────────────────────────────────────┤");
  console.log(`│   Channel:  ${CHANNEL_ID.padEnd(30)}│`);
  console.log(`│   Owner:    ${OWNER_ID.padEnd(30)}│`);
  console.log(`│   Interval: Every 5 minutes                 │`);
  console.log("└─────────────────────────────────────────────┘");

  // Launch the Telegraf bot (long-polling)
  await bot.launch();
  console.log("✅ Bot is online and listening for commands.\n");

  // Run the first poll immediately
  try {
    await processBroadcast(bot);
  } catch (err) {
    console.error("❌ Initial poll error:", err.message);
  }

  // Set up periodic polling
  setInterval(async () => {
    try {
      await processBroadcast(bot);
    } catch (err) {
      console.error(`❌ Poll error: ${err.message}`);
    }
  }, POLL_INTERVAL_MS);
}

// ─── Graceful Shutdown ──────────────────────────────────────────────

function gracefulShutdown(signal) {
  console.log(`\n⏹️  Received ${signal}. Shutting down gracefully...`);
  bot.stop(signal);
  process.exit(0);
}

process.once("SIGINT", () => gracefulShutdown("SIGINT"));
process.once("SIGTERM", () => gracefulShutdown("SIGTERM"));

// Handle uncaught errors so the process never crashes
process.on("uncaughtException", (err) => {
  console.error("🔥 Uncaught exception:", err.message);
});

process.on("unhandledRejection", (reason) => {
  console.error("🔥 Unhandled rejection:", reason);
});

// ─── Start ──────────────────────────────────────────────────────────
main().catch((err) => {
  console.error("💥 Fatal startup error:", err.message);
  process.exit(1);
});

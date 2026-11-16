
import { buildMenu } from "../lib/menu.js";

function formatDuration(seconds) {
  let remaining = Math.max(0, Math.floor(Number(seconds) || 0));
  const days = Math.floor(remaining / 86400);
  remaining %= 86400;
  const hours = Math.floor(remaining / 3600);
  remaining %= 3600;
  const minutes = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const parts = [];

  if (days) parts.push(days + "d");
  if (hours) parts.push(hours + "h");
  if (minutes) parts.push(minutes + "m");
  if (secs || !parts.length) parts.push(secs + "s");

  return parts.join(" ");
}

function messageTimestampMs(message) {
  const raw = message && message.messageTimestamp;
  const value = raw && typeof raw.toNumber === "function"
    ? raw.toNumber()
    : Number(raw);

  if (!Number.isFinite(value) || value <= 0) return null;
  return value > 1000000000000 ? value : value * 1000;
}

function ownerNumber(config) {
  const owners = Array.isArray(config.ownerNumbers) ? config.ownerNumbers : [];
  return String(owners[0] || "").replace(/\D/g, "");
}

const commands = [
  {
    name: "menu",
    aliases: ["helpme"],
    category: "General",
    description: "Show the branded FEI XMD menu and available command sections.",
    run: async ctx => {
      const menu = buildMenu({
        commands: ctx.commands,
        config: ctx.config,
        theme: ctx.theme
      });

      if (ctx.config.imageUrl) {
        try {
          await ctx.send({
            image: { url: ctx.config.imageUrl },
            caption:
              "⚡ *𝙁𝙀𝙄 𝙓𝙈𝘿 — 𝙒𝙃𝘼𝙏𝙎𝘼𝙋𝙋 𝘽𝙊𝙏*\n" +
              "◆ Official pairing portal: " + ctx.config.botUrl + "\n" +
              "⚡ 𝙋𝙊𝙒𝙀𝙍𝙀𝘿 𝘽𝙔 𝘽𝙀𝙉𝙁𝙀𝙄 𝙏𝙀𝘾𝙃"
          });
        } catch (error) {
          console.warn(
            "FEI XMD menu artwork could not be sent; using the text menu:",
            error?.message || error
          );
        }
      }

      await ctx.reply(menu);
    }
  },

  {
    name: "help",
    category: "General",
    description: "List registered commands and their descriptions.",
    run: async ctx => {
      const rows = (ctx.commands || [])
        .filter(command => !command.hidden)
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(command =>
          ctx.config.prefix + command.name +
          (command.description ? " ─ " + command.description : "")
        );

      const header =
        "╭━━━⟪ 📚 𝙁𝙀𝙄 𝙓𝙈𝘿 𝙃𝙀𝙇𝙋 ⟫━━━◆\n" +
        "┃ ◈ 𝘾𝙊𝙈𝙈𝘼𝙉𝘿𝙎: " + rows.length + "\n" +
        "╰━━━━━━━━━━━━━━◆\n\n";

      const chunks = [];
      let current = header;

      for (const row of rows) {
        if (current.length + row.length + 1 > 3300) {
          chunks.push(current.trimEnd());
          current =
            "╭━━━⟪ 📚 𝙁𝙀𝙄 𝙓𝙈𝘿 𝙃𝙀𝙇𝙋 (𝘾𝙊𝙉𝙏𝙄𝙉𝙐𝙀𝘿) ⟫━━━◆\n\n";
        }

        current += "┃ ┣➤ " + row + "\n";
      }

      if (current.trim()) chunks.push(current.trimEnd());

      for (const chunk of chunks) await ctx.reply(chunk);
    }
  },

  {
    name: "ping",
    category: "General",
    description: "Check bot responsiveness and estimated message response time.",
    run: async ctx => {
      const timestamp = messageTimestampMs(ctx.msg);
      const responseMs = timestamp === null
        ? null
        : Math.max(0, Date.now() - timestamp);

      await ctx.reply([
        "╭━━━⟪ 🏓 𝙁𝙀𝙄 𝙓𝙈𝘿 · 𝙋𝙊𝙉𝙂 ⟫━━━◆",
        "┃ ◈ 𝙎𝙏𝘼𝙏𝙐𝙎: " +
          (ctx.connectionOpen ? "𝙊𝙉𝙇𝙄𝙉𝙀 🟢" : "𝘾𝙊𝙉𝙉𝙀𝘾𝙏𝙄𝙉𝙂 🟡"),
        "┃ ◈ 𝙍𝙀𝙎𝙋𝙊𝙉𝙎𝙀: " +
          (responseMs === null ? "𝙐𝙉𝘼𝙑𝘼𝙄𝙇𝘼𝘽𝙇𝙀" : responseMs + " ms"),
        "┃ ◈ 𝙐𝙋𝙏𝙄𝙈𝙀: " + formatDuration(process.uptime()),
        "┃ ◈ 𝙑𝙀𝙍𝙎𝙄𝙊𝙉: " + ctx.config.version,
        "╰━━━━━━━━━━━━━━◆",
        "",
        "⚡ 𝙋𝙊𝙒𝙀𝙍𝙀𝘿 𝘽𝙔 𝘽𝙀𝙉𝙁𝙀𝙄 𝙏𝙀𝘾𝙃"
      ].join("\n"));
    }
  },

  {
    name: "alive",
    aliases: ["uptime"],
    category: "General",
    description: "Show bot status, mode and uptime.",
    run: async ctx => {
      await ctx.reply([
        "╭━━━⟪ ⚡ 𝘽𝙊𝙏 𝙎𝙏𝘼𝙏𝙐𝙎 ⟫━━━◆",
        "┃ ◈ 𝙉𝘼𝙈𝙀: " + ctx.config.name,
        "┃ ◈ 𝙎𝙏𝘼𝙏𝙐𝙎: " +
          (ctx.connectionOpen ? "𝙊𝙉𝙇𝙄𝙉𝙀 🟢" : "𝘾𝙊𝙉𝙉𝙀𝘾𝙏𝙄𝙉𝙂 🟡"),
        "┃ ◈ 𝙈𝙊𝘿𝙀: " + String(ctx.mode || "public").toUpperCase(),
        "┃ ◈ 𝙐𝙋𝙏𝙄𝙈𝙀: " + formatDuration(process.uptime()),
        "╰━━━━━━━━━━━━━━◆",
        "",
        "⚡ 𝙋𝙊𝙒𝙀𝙍𝙀𝘿 𝘽𝙔 " + ctx.config.ownerName
      ].join("\n"));
    }
  },

  {
    name: "owner",
    category: "General",
    description: "Show Benfei Tech owner details.",
    run: async ctx => {
      const number = ownerNumber(ctx.config);

      await ctx.reply([
        "╭━━━⟪ 👑 𝘽𝙊𝙏 𝙊𝙒𝙉𝙀𝙍 ⟫━━━◆",
        "┃ ◈ 𝙉𝘼𝙈𝙀: " + ctx.config.ownerName,
        ...(number ? ["┃ ◈ 𝙉𝙐𝙈𝘽𝙀𝙍: +" + number] : []),
        "╰━━━━━━━━━━━━━━◆",
        "",
        "⚡ 𝘽𝙀𝙉𝙁𝙀𝙄 𝙏𝙀𝘾𝙃"
      ].join("\n"));
    }
  },

  {
    name: "support",
    category: "General",
    description: "Show support guidance for FEI XMD.",
    run: async ctx => {
      await ctx.reply([
        "╭━━━⟪ 🛟 𝙁𝙀𝙄 𝙓𝙈𝘿 𝙎𝙐𝙋𝙋𝙊𝙍𝙏 ⟫━━━◆",
        "┃ ◈ 𝙁𝙊𝙍 𝙃𝙀𝙇𝙋:",
        "┃ ┣➤ Setup assistance",
        "┃ ┣➤ Bug reports",
        "┃ ┗➤ General inquiries",
        "┃",
        "┃ ◈ 𝘾𝙊𝙉𝙏𝘼𝘾𝙏: " + ctx.config.ownerName,
        "┃ ◈ 𝙂𝙄𝙏𝙃𝙐𝘽:",
        "┃ https://github.com/Benfeitech/FEI-XMD",
        "╰━━━━━━━━━━━━━━◆",
        "",
        "⚡ 𝙋𝙊𝙒𝙀𝙍𝙀𝘿 𝘽𝙔 𝘽𝙀𝙉𝙁𝙀𝙄 𝙏𝙀𝘾𝙃"
      ].join("\n"));
    }
  },

  {
    name: "time",
    category: "General",
    description: "Show the current server time in Nigeria.",
    run: async ctx => {
      const value = new Intl.DateTimeFormat("en-NG", {
        timeZone: "Africa/Lagos",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      }).format(new Date());

      await ctx.reply(
        "╭━━━⟪ 🕒 𝙉𝙄𝙂𝙀𝙍𝙄𝘼 𝙏𝙄𝙈𝙀 ⟫━━━◆\n" +
        "┃ ◈ " + value + "\n" +
        "╰━━━━━━━━━━━━━━◆"
      );
    }
  },

  {
    name: "date",
    category: "General",
    description: "Show the current date in Nigeria.",
    run: async ctx => {
      const value = new Intl.DateTimeFormat("en-NG", {
        timeZone: "Africa/Lagos",
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric"
      }).format(new Date());

      await ctx.reply(
        "╭━━━⟪ 📅 𝘿𝘼𝙏𝙀 𝙄𝙉 𝙉𝙄𝙂𝙀𝙍𝙄𝘼 ⟫━━━◆\n" +
        "┃ ◈ " + value + "\n" +
        "╰━━━━━━━━━━━━━━◆"
      );
    }
  },

  {
    name: "version",
    category: "General",
    description: "Show FEI XMD version and connection status.",
    run: async ctx => {
      await ctx.reply([
        "╭━━━⟪ 🤖 𝙁𝙀𝙄 𝙓𝙈𝘿 𝙑𝙀𝙍𝙎𝙄𝙊𝙉 ⟫━━━◆",
        "┃ ◈ 𝙉𝘼𝙈𝙀: " + ctx.config.name,
        "┃ ◈ 𝙑𝙀𝙍𝙎𝙄𝙊𝙉: v" + ctx.config.version,
        "┃ ◈ 𝙎𝙏𝘼𝙏𝙐𝙎: " +
          (ctx.connectionOpen ? "𝙊𝙉𝙇𝙄𝙉𝙀 🟢" : "𝘾𝙊𝙉𝙉𝙀𝘾𝙏𝙄𝙉𝙂 🟡"),
        "┃ ◈ 𝙈𝙊𝘿𝙀: " + String(ctx.mode || "public").toUpperCase(),
        "┃ ◈ 𝙇𝙄𝘽𝙍𝘼𝙍𝙔: 𝘽𝘼𝙄𝙇𝙀𝙔𝙎",
        "╰━━━━━━━━━━━━━━◆",
        "",
        "⚡ 𝙋𝙊𝙒𝙀𝙍𝙀𝘿 𝘽𝙔 𝘽𝙀𝙉𝙁𝙀𝙄 𝙏𝙀𝘾𝙃"
      ].join("\n"));
    }
  },

  {
    name: "jid",
    aliases: ["id"],
    category: "General",
    description: "Show the current chat and message sender IDs.",
    run: async ctx => {
      await ctx.reply([
        "╭━━━⟪ 🆔 𝘾𝙃𝘼𝙏 𝙄𝙉𝙁𝙊 ⟫━━━◆",
        "┃ ◈ 𝘾𝙃𝘼𝙏 𝙄𝘿: " + ctx.jid,
        "┃ ◈ 𝙎𝙀𝙉𝘿𝙀𝙍 𝙄𝘿: " + (ctx.senderJid || "Unavailable"),
        "╰━━━━━━━━━━━━━━◆"
      ].join("\n"));
    }
  },

  {
    name: "whoami",
    category: "General",
    description: "Show your WhatsApp sender information.",
    run: async ctx => {
      await ctx.reply([
        "╭━━━⟪ 👤 𝙐𝙎𝙀𝙍 𝙄𝙉𝙁𝙊 ⟫━━━◆",
        "┃ ◈ 𝙉𝘼𝙈𝙀: " + (ctx.msg?.pushName || "Unknown"),
        "┃ ◈ 𝙐𝙎𝙀𝙍 𝙄𝘿: " + (ctx.senderJid || "Unavailable"),
        "┃ ◈ 𝙊𝙒𝙉𝙀𝙍: " + (ctx.owner ? "𝙔𝙀𝙎 👑" : "𝙉𝙊"),
        "╰━━━━━━━━━━━━━━◆"
      ].join("\n"));
    }
  }
];

export default commands;

import { Client, IntentsBitField } from "discord.js";
import { preload } from "./preloaded";
import discordEventHandler from "./handlers/discordEventHandler";
import { errorLogger } from "./helpers/utils/handleError";

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildExpressions,
    IntentsBitField.Flags.GuildInvites,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessagePolls,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildModeration,
    IntentsBitField.Flags.GuildVoiceStates,
    IntentsBitField.Flags.GuildWebhooks,
    IntentsBitField.Flags.DirectMessagePolls,
    IntentsBitField.Flags.DirectMessageReactions,
    IntentsBitField.Flags.DirectMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

async function run(client: Client) {
  try {
    console.log("⭐==============Phiradian==============⭐");
    console.log("🔮 | Starting prepare everything");
    preload();
    console.log("🍞 | Loaded all stuffs into RAM");
    discordEventHandler(client);
    client.setMaxListeners(100);
    client.login(process.env.BOT_TOKEN as string);
  } catch (error: any) {
    console.log(`\x1b[31m\x1b[1m=> ${error.name}\x1b[0m`);
    console.log(`\x1b[32m${error.message}\x1b[0m`);
    errorLogger(error);
  }
}

run(client);

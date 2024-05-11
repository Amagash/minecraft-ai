import debug from "debug";
import minecraftData from "minecraft-data";
import mineflayer from "mineflayer";
import { mineflayer as mineflayerViewer } from "prismarine-viewer";
import { invokeClaude, extractCodeSnippet } from "./api.js";
import {
  context,
  updateContext,
  loadContext,
  clearContext,
} from "./context/index.js";
import collectBlock from "mineflayer-collectblock";

//@ts-ignore
import mineflayerPathfinder  from "mineflayer-pathfinder";
const { pathfinder } = mineflayerPathfinder;

// load available skills
//@ts-ignore
import { watchPlayer, goToPlayer, mineBlock, giveToPlayer } from "./skills/sample.js";

const log = debug("minecraft-aws.bot:log");
const error = debug("minecraft-aws.bot:error");

// define global variable that will be used to craft items and interact with the world
var mcData;
var goToPlayerInterval;
var watchInterval;
var target;

// a workaround to avoid Code from removing these variables
goToPlayerInterval = null;
watchInterval = null;
mcData = null;
target = null;

export default async function bot(host, port, username) {
  const bot = mineflayer.createBot({
    username: username || "Claude",
    host: host || "localhost",
    port,
    verbose: true,
  });

  // on error
  bot.on("error", (err) => {
    error(err);
  });

  bot.on("login", () => {
    log("Claude joined the game");
  });

  bot.on("chat", async (username, input) => {
    if (username === bot.username) return;

    if (input.startsWith("load context")) {
      const contextName = input.replace("load context", "").trim();
      if (contextName) {
        await loadContext(contextName);
        bot.chat(`Loaded context ${contextName}`);
        return;
      }
    } else if (input.startsWith("reset context")) {
      clearContext();
      bot.chat("Cleared context");
      return;
    }

    const previousContext = context();
    log("input: %s", input);
    log("context: %s", previousContext);

    // call the Claude API
    const response = await invokeClaude(input, previousContext);
    target = bot.players[username].entity;

    if (response) {
      console.log(`response: ${response}`);
      const code = extractCodeSnippet(response);
      console.log(`code: ${code}`);
      // log("request: %s", response.id);
      // log("codex: %s", response.model);
      // log("choices: %o", response.choices);

      // extract code instructions from response
      // const code = await response.choices
      //   .map((choice) => choice.text)
      //   .join("\n");
      // log("code: ", code);

      if (response === "") {
        bot.chat(`I am sorry, I don't understand.`);
        return;
      }

      try {
        // WARNING: this is a very dangerous way to execute code! Do you trust AI?
        // Note: the code is executed in the context of the bot entity
        await eval(`(async function inject() { 
          try {
            ${code}
          } 
          catch(err){
            error("error: %s", err.message);
            bot.chat(\`error: \${err.message}\`);
          } 
        })()`);

        // update the context for the next time
        // Note: we only update context if the code is valid
        // updateContext(input, response);
      } catch (err) {
        error("error: %s", err.message);
        bot.chat(`error: ${err.message}`);
      }
    } else {
      log("Claude response was empty. Ignore.");
    }
  });

  // Log errors and kick reasons:
  bot.on("kicked", log);
  bot.on("error", log);

  bot.once("spawn", () => {
    mcData = minecraftData(bot.version);
    log("Minecraft version: %s", bot.version);
    log("Minecraft protocol version: %s", bot.protocolVersion);

    // load all plugins
    bot.loadPlugin(collectBlock.plugin);
    bot.loadPlugin(pathfinder);

    // port is the minecraft server port, if first person is false, you get a bird's-eye view
    try {
      mineflayerViewer(bot, { port: 31337, firstPerson: true });
    } catch (err) {
      error("error: %s", err.message);
    }
  });
}

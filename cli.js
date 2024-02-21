#!/usr/bin/env node

import debug from "debug";
import bot from "./bot.js";
import { program } from "commander";

const log = debug("minecraft-aws.cli:log");
const error = debug("minecraft-aws.cli:error");

program
  .name("minecraft-aws")
  .description("Playing Minecraft with AWS (proof of concept)")
  
program.command('start')
  .description('start the bot')
  .option("--host <host>", "hostname of the minecraft server", "localhost")
  .option("--port <port>", "port of the minecraft server", 25565)
  .option("--username <username>", "username of the bot", "Claude")
  .action(async(options) => {
    log("starting bot");
    await bot(options.host, options.port, "Claude").catch(error);
  });


program.parse();


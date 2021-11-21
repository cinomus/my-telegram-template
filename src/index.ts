import { bot } from "./app";

function start() {
  bot.launch().then(() => {
    console.log("Bot started!");
  });
}
start();

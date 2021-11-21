import { Context, Telegraf } from "telegraf";
import config from "config";
import { Database } from "./database";
import { MyContext } from "./interfaces/context.interface";

export const bot = new Telegraf<MyContext>(config.get("BOT_TOKEN"));
export const database = new Database();

bot.use(database.getUserSessionFunction());
bot.use(database.getGeneralSessionFunction());

bot.start(async (ctx) => {
  ctx.session.yaebal = true;
  await ctx.reply("реально ебал");
});

async function start() {
  await database.connectionToDatabase();
  await bot.launch().then(() => {
    console.log("Bot started!");
  });
}

start();

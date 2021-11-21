import { MongoClient } from "mongodb";
import config from "config";
import { Context } from "telegraf";
import { database } from "./main";

export class Database {
  userSession = "session"; //  имя переменной в ctx
  generalSession = "generalSession"; // имя переменной в ctx

  userSessionsCollection = "userSessionsCollection"; // отдельные сессии для каждого пользователя
  generalSessionCollection = "generalSessionCollection"; // общая сессия для сбора статистики

  client: any;
  database: any;
  collectionOfUsers: any;
  generalCollection: any;
  async connectionToDatabase(): Promise<void> {
    try {
      this.client = await MongoClient.connect(config.get("MONGO_URL"));
      this.database = await this.client.db(config.get("DATABASE_NAME"));
      this.collectionOfUsers = this.database.collection(
        this.userSessionsCollection
      );
      this.generalCollection = this.database.collection(
        this.generalSessionCollection
      );
    } catch (e) {
      console.log(e);
    }
  }

  getUserSessionFunction() {
    return async (ctx: Context, next: () => Promise<void>) => {
      const key = await this.getSessionKey(ctx);
      ctx[this.userSession] =
        key == null ? undefined : await this.getSession(key);
      await next();

      if (ctx[this.userSession] != null) {
        await this.saveSession(key, ctx[this.userSession]);
      }
    };
  }
  getGeneralSessionFunction() {
    return async (ctx: Context, next: () => Promise<void>) => {
      ctx[this.generalSession] = await this.getGeneralSession(
        "-generalSession-"
      );
      await next();

      if (ctx[this.generalSession] != null) {
        await this.saveGeneralSession(
          "-generalSession-",
          ctx[this.generalSession]
        );
      }
    };
  }
  //

  async saveSession(key, data) {
    console.log("saveSession", key, data);
    const result = await this.collectionOfUsers.updateOne(
      { key },
      { $set: { data } },
      { upsert: true }
    );
    console.log(result);
    return result;
  }
  async getSession(key) {
    const item = await this.collectionOfUsers.findOne({ key });
    if (item !== null) return item.data;
    else return {};
  }
  async saveGeneralSession(key, data) {
    await this.generalCollection.updateOne(
      { key },
      { $set: { data } },
      { upsert: true }
    );
  }
  async getGeneralSession(key) {
    const item = await this.generalCollection.findOne({ key });
    if (item !== null) return item.data;
    else return {};
  }
  async getSessionKey({ from, chat }: Context): Promise<string> {
    if (from == null || chat == null) {
      return null;
    }

    return `${from.id}:${chat.id}`;
  }
}

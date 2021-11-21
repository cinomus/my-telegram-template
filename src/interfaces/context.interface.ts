import { Context } from "telegraf";
export interface MyContext extends Context {
  session: any;
  generalSession: any;
}

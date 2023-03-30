// Import packages
import { Bot } from 'grammy'
import Debug from 'debug'
import dotenv from 'dotenv'

// Initial packages
dotenv.config()
const bot = new Bot(process.env.TELEGPT_TELEGRAM_TOKEN ?? "")
const print = Debug('telegpt:app.ts')

bot.command('start', (ctx) => {
  print('Hello World!')
  ctx.reply('Hello World!')
})



// Start bot
bot.start()
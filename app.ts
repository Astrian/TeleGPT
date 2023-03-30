// Import packages
import { Bot } from 'grammy'
import Debug from 'debug'
import dotenv from 'dotenv'

// Import functions
import * as functions from './functions'

// Initial packages
dotenv.config()
const bot = new Bot(process.env.TELEGPT_TELEGRAM_TOKEN ?? "")
const print = Debug('telegpt:app.ts')

bot.command('start', async (ctx) => {
  print('Hello World!')
  // Create user
  try {
    await functions.create_user(ctx.from?.id ?? 0)
    ctx.reply('Hello World!')
  } catch (err) {
    print(err)
    return ctx.reply('Cannot create user, please try again.')
  }
})

bot.command('newthread', async (ctx) => {
  print('New Thread')
  
  // Get thread name from message
  const thread_name = ctx.message?.text?.split(' ')[1]
  print(thread_name)

  // Check if thread name is valid
  if (thread_name === undefined || thread_name === '') return ctx.reply('Please provide a thread name')
  try {
  // Create thread
    print(ctx.from)
    await functions.create_thread(thread_name, ctx.from?.id ?? 0, `${ctx.from?.first_name ?? 'Unknown'}${ctx.from?.last_name ? ' ' + ctx.from?.last_name : ''}`)
  } catch (err) {
    print(err)
    return ctx.reply('Cannot create thread, please try again.')
  }
})

// Start bot
bot.start()
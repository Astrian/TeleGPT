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
  // User limit
  print(await functions.user_limit(ctx.from?.id ?? 0))
  if (!await functions.user_limit(ctx.from?.id ?? 0)) return ctx.reply('You are not allowed to use this bot.')

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
  // User limit
  if (!await functions.user_limit(ctx.from?.id ?? 0)) return ctx.reply('You are not allowed to use this bot.')

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
    ctx.reply('Thread created! Now your active thread is switched, and you can start a fresh-new chatting.')
  } catch (err) {
    print(err)
    return ctx.reply('Cannot create thread, please try again.')
  }
})

bot.command('list', async (ctx) => {
  // User limit
  if (!await functions.user_limit(ctx.from?.id ?? 0)) return ctx.reply('You are not allowed to use this bot.')

  print('List Threads')
  // list all threads to user
  try {
    let threads = await functions.list_threads(ctx.from?.id ?? 0)
    let thread_list: {text: string, callback_data: string}[][] = []
    for (let thread in threads) {
      thread_list.push([{
        text: threads[thread].topic,
        callback_data: `select:${threads[thread].id}`
      }])
    }
    if (thread_list.length === 0) return ctx.reply('You have no threads yet. Use /newthread to create a new thread.')
    ctx.reply("Select a thread", { reply_markup: { inline_keyboard: thread_list } })
  } catch (err) {
    print(err)
    return ctx.reply('Oops, something went wrong.')
  }
})

bot.on('callback_query', async (ctx) => {
  // User limit
  if (!await functions.user_limit(ctx.from?.id ?? 0)) return ctx.reply('You are not allowed to use this bot.')

  print('Callback Query')
  // Get callback data
  const callback_data = ctx.callbackQuery?.data?.split(':')
  if (callback_data === undefined) return ctx.reply('Oops, something went wrong.')
  print(callback_data)
  // Get thread name
  let thread_list = await functions.list_threads(ctx.from?.id ?? 0)
  let thread_name = ''
  for (let thread in thread_list) {
    if (thread_list[thread].id === callback_data[1]) {
      thread_name = thread_list[thread].topic
      break
    }
  }

  switch (callback_data[0]) {
    case 'select':
      // Change message into thread operation inline markup keyboard
      try {
        await bot.api.editMessageText(
          ctx.callbackQuery?.message?.chat.id ?? 0,
          ctx.callbackQuery?.message?.message_id ?? 0,
          `Selected thread: ${thread_name}`
        )
        await bot.api.editMessageReplyMarkup(
          ctx.callbackQuery?.message?.chat.id ?? 0,
          ctx.callbackQuery?.message?.message_id ?? 0,
          {reply_markup: {
            inline_keyboard: [
              [{
                text: 'Delete',
                callback_data: `delete:${callback_data[1]}`
              },
              {
                text: 'Switch',
                callback_data: `switch:${callback_data[1]}`
              }],
              [{
                text: 'Cancel',
                callback_data: 'list'
              }]
            ]
          }
        })
      } catch (err) {
        print(err)
        return ctx.reply('Oops, something went wrong.')
      }
      break
    
    case 'delete':
      // Delete thread
      try {
        await functions.delete_thread(callback_data[1])
        bot.api.editMessageText(
          ctx.callbackQuery?.message?.chat.id ?? 0,
          ctx.callbackQuery?.message?.message_id ?? 0,
          `Deleted thread: ${thread_name}`
        )
      } catch(e) {
        print(e)
        return ctx.reply('Oops, something went wrong.')
      }
      break
    
    case 'switch':
      // Switch thread
      try {
        await functions.switch_thread(callback_data[1], ctx.from?.id ?? 0)
        bot.api.editMessageText(
          ctx.callbackQuery?.message?.chat.id ?? 0,
          ctx.callbackQuery?.message?.message_id ?? 0,
          `Switched thread: ${thread_name}`
        )
      } catch(e) {
        print(e)
        return ctx.reply('Oops, something went wrong.')
      }
      break

    case 'list':
      // List threads
      try {
        let threads = await functions.list_threads(ctx.from?.id ?? 0)
        let thread_list: {text: string, callback_data: string}[][] = []
        for (let thread in threads) {
          thread_list.push([{
            text: threads[thread].topic,
            callback_data: `select:${threads[thread].id}`
          }])
        }
        
        // ctx.reply("Select a thread", { reply_markup: { inline_keyboard: thread_list } })
        if (thread_list.length === 0) return await bot.api.editMessageText(
          ctx.callbackQuery?.message?.chat.id ?? 0,
          ctx.callbackQuery?.message?.message_id ?? 0,
          'You have no threads yet. Use /newthread to create a new thread.'
        )
        await bot.api.editMessageText(
          ctx.callbackQuery?.message?.chat.id ?? 0,
          ctx.callbackQuery?.message?.message_id ?? 0,
          'Select a thread'
        )
        await bot.api.editMessageReplyMarkup(
          ctx.callbackQuery?.message?.chat.id ?? 0,
          ctx.callbackQuery?.message?.message_id ?? 0,
          {reply_markup: { inline_keyboard: thread_list }}
        )
      } catch (err) {
        print(err)
        return ctx.reply('Oops, something went wrong.')
      }
  }
})

bot.on('message:text', async (ctx) => {
  // User limit
  if (!await functions.user_limit(ctx.from?.id ?? 0)) return ctx.reply('You are not allowed to use this bot.')

  try {
    // Send "typing" action
    bot.api.sendChatAction(ctx.chat?.id ?? 0, 'typing')
    let response = await functions.new_message(ctx.message?.text ?? '', ctx.from?.id ?? 0)
    ctx.reply(response)
  } catch (err) {
    print(err)
    return ctx.reply('Oops, something went wrong.')
  }
})

bot.on('inline_query', async (ctx) => {
  // User limit
  if (!await functions.user_limit(ctx.from?.id ?? 0)) return ctx.answerInlineQuery([])
  print('Inline Query')

  // Get inline query
  try {
    let response = await functions.inline_query(ctx.inlineQuery?.query ?? '',  `${ctx.from?.first_name}${ctx.from?.last_name ? ' ' + ctx.from?.last_name : ''}`)
    if (ctx.inlineQuery?.query === undefined || ctx.inlineQuery?.query === "") return ctx.answerInlineQuery([])
    ctx.answerInlineQuery([{
      type: 'article',
      id: '1',
      title: 'Reply from GPT...',
      input_message_content: {
        message_text: `<b>Q: ${ctx.inlineQuery?.query ?? ''}</b>\nA: ${response}`,
        parse_mode: 'HTML'
      },
      description: response,
    }],
    {
      cache_time: 0
    })
  } catch (err) {
    print(err)
    return ctx.answerInlineQuery([])
  }
})

// Start bot
bot.start()
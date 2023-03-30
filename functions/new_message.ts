/// <reference path="../typings/index.d.ts" />

// Import packages
import Debug from 'debug'
import sqlite3 from 'sqlite3'
import * as uuid from 'uuid'
import axios from 'axios'

// Initial packages
const print = Debug('telegpt:functions/create_thread.ts')
const db = new sqlite3.Database('./data.db')

// Transfer sqlite3 to promise
const db_promise = (sql: string, params: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err: any, result: any) => {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })
  })
}

const new_message = async (content: string, sender: number): Promise<string> => {
  // Fetch user's active thread
  const user_data = await db_promise('SELECT * FROM users WHERE id = ?', [sender])
  if (user_data.length === 0) {
    // User not found
    return ''
  }
  const active_thread = user_data[0].active_thread

  // Fetch messages from active thread
  const history_messages = await db_promise('SELECT * FROM messages WHERE thread = ?', [active_thread])
  print(history_messages)

  // Organize messages
  let messages: Message[] = []
  for (let i = 0; i < history_messages.length; i++) {
    const message = history_messages[i]
    messages.push({
      role: message.identity,
      content: message.content
    })
  }
  // Attach user's message
  messages.push({
    role: 'user',
    content: content
  })
  print(messages)
  
  let response = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: "gpt-3.5-turbo-0301",
    messages
  }, {
    headers: {
      'Authorization': `Bearer ${process.env.TELEGPT_OPENAI_API_KEY}`
    }
  })
  // Write user message and bot response to database
  await db_promise('INSERT INTO messages (id, user, thread, identity, content, sent_at) VALUES (?, ?, ?, ?, ?, ?)', [uuid.v4(), sender, active_thread, 'user', content, new Date().getTime()])
  await db_promise('INSERT INTO messages (id, user, thread, identity, content, sent_at) VALUES (?, ?, ?, ?, ?, ?)', [uuid.v4(), sender, active_thread, 'assistant', response.data.choices[0].message.content, new Date().getTime()])
  return(response.data.choices[0].message.content)
}

export { new_message }
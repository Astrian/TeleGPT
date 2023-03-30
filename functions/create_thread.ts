// Import packages
import Debug from 'debug'
import sqlite3 from 'sqlite3'
import * as uuid from 'uuid'

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

const create_thread = async (topic: string, user: number, name: string)=> {
  print(`Creating thread ${topic}`)
  const thread_id = uuid.v4()
  await db_promise('INSERT INTO threads (id, topic, user, create_at) VALUES (?, ?, ?, ?)', [thread_id, topic, user, new Date().getTime()])
  // Create a system message
  await db_promise('INSERT INTO messages (id, user, thread, identity, content, sent_at) VALUES (?, ?, ?, ?, ?, ?)', [uuid.v4(), 0, thread_id, 'system', `A user created a new thread. The title of the thread is “${topic}”, this thread may be related to this topic. The name of the user is “${name}”.`, new Date().getTime()])

  await db_promise('UPDATE users SET active_thread = ? WHERE id = ?', [thread_id, user])
}

export { create_thread }
// Import packages
import Debug from 'debug'
import sqlite3 from 'sqlite3'

// Initial packages
const print = Debug('telegpt:functions/list_threads.ts')
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

const list_threads = async (sender: number): Promise<Thread[]> => {
  const user_data = await db_promise('SELECT * FROM users WHERE id = ?', [sender])
  if (user_data.length === 0) {
    // User not found
    return []
  }
  const threads = await db_promise('SELECT * FROM threads', [])
  let result: Thread[] = []
  for (let i = 0; i < threads.length; i++) {
    const thread: Thread = threads[i]
    result.push({
      id: thread.id,
      topic: thread.topic,
      create_at: thread.create_at
    })
  }
  return result
}

export { list_threads }
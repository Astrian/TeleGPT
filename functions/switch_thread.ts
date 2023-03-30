// Import packages
import Debug from 'debug'
import sqlite3 from 'sqlite3'

// Initial packages
const print = Debug('telegpt:functions/delete_thread.ts')
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

const switch_thread = async (thread: string, user: number) => {
  // Switch thread
  await db_promise('UPDATE users SET active_thread = ? WHERE id = ?', [thread, user])
}

export { switch_thread }
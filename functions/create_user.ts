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

const create_user = async (user: number)=> {
  // Check if user is exist
  const user_data = await db_promise('SELECT * FROM users WHERE id = ?', [user])
  if (user_data.length === 0) {
    // Create a new user
    await db_promise('INSERT INTO users (id, active_thread) VALUES (?, ?)', [user, ''])
  }
}

export { create_user }
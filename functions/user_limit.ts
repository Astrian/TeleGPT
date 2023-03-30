// Import packages
import Debug from 'debug'
import dotenv from 'dotenv'

// Initial packages
const print = Debug('telegpt:functions/user_limit.ts')
dotenv.config()

const user_limit = async (sender: number): Promise<Boolean> => {
  // Check if user is available for use this bot
  process.env.TELEGPT_LIMIT_USER?.split(',').forEach((user) => {
    if (user === sender.toString()) {
      return true
    }
  })
  return false
}

export { user_limit }
// Import packages
import Debug from 'debug'
import dotenv from 'dotenv'

// Initial packages
const print = Debug('telegpt:functions/user_limit.ts')
dotenv.config()

const user_limit = async (sender: number): Promise<Boolean> => {
  // Check if user is available for use this bot
  let allowed_user = process.env.TELEGPT_LIMIT_USER?.split(',') ?? []
  let allowed = false
  for (let i = 0; i < (allowed_user?.length ?? 0); i++) {
    if (allowed_user[i] === sender.toString()) {
      allowed = true
      break
    }
  }
  return allowed
}

export { user_limit }
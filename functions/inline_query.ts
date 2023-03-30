/// <reference path="../typings/index.d.ts" />

// Import packages
import Debug from 'debug'
import * as uuid from 'uuid'
import axios from 'axios'

// Initial packages
const print = Debug('telegpt:functions/inline_query.ts')

const inline_query = async (content: string, name: string): Promise<string> => {

  // Organize messages
  let messages: Message[] = [{
    role: 'system',
    content: `A user named “${name}” called you in an IM conversations, you are replying to this user.`
  }, {
    role: 'user',
    content
  }]
  print(messages)

  let response = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: "gpt-3.5-turbo-0301",
    messages
  }, {
    headers: {
      'Authorization': `Bearer ${process.env.TELEGPT_OPENAI_API_KEY}`
    }
  })
  return(response.data.choices[0].message.content)
}

export { inline_query }
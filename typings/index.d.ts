type Message = {
  "role": "system"|"user"|"assistant",
  "content": string
}

type Thread = {
  "id": string,
  "topic": string,
  "create_at": number,
}
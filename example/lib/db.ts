import { Static } from "elysia"

import { schema } from "./schema"

let users: Static<typeof schema.user>[] = [
	{
		id: crypto.randomUUID(),
		name: "John Doe",
		email: "john.doe@example.com"
	}
]

let messages: Static<typeof schema.message>[] = [
	{
		id: crypto.randomUUID(),
		threadId: crypto.randomUUID(),
		userId: users[0].id,
		role: "user",
		content: "Hello, how are you?",
		createdAt: new Date()
	},
	{
		id: crypto.randomUUID(),
		threadId: crypto.randomUUID(),
		userId: users[0].id,
		role: "assistant",
		content: "I'm fine, thank you!",
		createdAt: new Date()
	}
]

export { users, messages }

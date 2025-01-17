import { Static } from "elysia"

import { schema } from "./schema"

let users: Static<typeof schema.user>[] = [
	{
		id: crypto.randomUUID(),
		name: "John Doe",
		email: "john.doe@example.com"
	}
]

export { users }

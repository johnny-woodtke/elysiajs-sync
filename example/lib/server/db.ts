// Normally the server DB schema is different from the client DB schema,
// but for this example we'll use the same schema for both
import { config } from "@/lib/client/schema"
import { Static } from "elysia"

export const todos: Static<typeof config.schema.todo>[] = []

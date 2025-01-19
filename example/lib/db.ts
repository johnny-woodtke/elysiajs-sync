import { Static } from "elysia"

import { schema } from "./schema"

export const todos: Static<typeof schema.todo>[] = []

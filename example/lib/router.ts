import { cors } from "@elysiajs/cors"
import { swagger } from "@elysiajs/swagger"
import Elysia from "elysia"

import { messagesRouter } from "./messages/router"
import { usersRouter } from "./users/router"

export const app = new Elysia({ prefix: "/api" })

	.use(cors())
	.use(usersRouter)
	.use(messagesRouter)
	.use(swagger())

export type App = typeof app

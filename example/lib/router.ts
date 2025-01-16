import { cors } from "@elysiajs/cors"
import { swagger } from "@elysiajs/swagger"
import Elysia, { t } from "elysia"

import sync, { tSync as _tSync } from "../../src"
import { schema } from "./schema"

const tSync = _tSync(schema)

export const app = new Elysia({ prefix: "/api" })
	.use(cors())
	.use(sync(schema))
	.get(
		"/",
		({ sync }) => {
			return sync("Hello world", {
				insert: {
					user: {
						data: {
							id: "1",
							name: "John Doe",
							email: "john.doe@example.com"
						}
					}
				}
			})
		},
		{
			response: {
				200: tSync(t.String())
			}
		}
	)
	.use(swagger())

export type App = typeof app

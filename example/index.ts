import sync, { tSync as _tSync } from "../src"
import { schema } from "./schema"
import { cors } from "@elysiajs/cors"
import { swagger } from "@elysiajs/swagger"
import Elysia, { t } from "elysia"

const tSync = _tSync(schema)

const app = new Elysia()
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
	.listen(3000)

import { cors } from "@elysiajs/cors"
import { swagger } from "@elysiajs/swagger"
import Elysia, { Static, t } from "elysia"

import sync, { tSync as _tSync } from "../../src"
import { users } from "./db"
import { schema } from "./schema"

const tSync = _tSync(schema)

export const app = new Elysia({ prefix: "/api" })
	.use(cors())
	.use(sync(schema))
	.get(
		"/users",
		({ sync }) => {
			return sync(users, {
				upsert: {
					user: users.map((user) => ({
						filter: {
							id: user.id
						},
						data: user
					}))
				}
			})
		},
		{
			response: {
				200: tSync(t.Array(schema.user))
			}
		}
	)
	.post(
		"/users",
		({ sync, body }) => {
			// create user
			const user = {
				id: crypto.randomUUID(),
				...body
			}
			users.push(user)

			// return user and sync
			return sync(user, {
				insert: {
					user: {
						filter: {
							id: user.id
						},
						data: user
					}
				}
			})
		},
		{
			body: t.Omit(schema.user, ["id"]),
			response: {
				200: tSync(schema.user)
			}
		}
	)
	.get(
		"/users/:id",
		({ sync, params, error }) => {
			// find user
			const user = users.find((user) => user.id === params.id)
			if (!user) {
				return error(404, "User not found")
			}

			// return user and sync
			return sync(user, {
				upsert: {
					user: {
						filter: {
							id: params.id
						},
						data: user
					}
				}
			})
		},
		{
			params: t.Object({
				id: t.String()
			}),
			response: {
				200: tSync(schema.user),
				404: t.String()
			}
		}
	)
	.post(
		"/users/:id",
		({ sync, body, params, error }) => {
			// find/update user
			const index = users.findIndex((user) => user.id === params.id)
			if (index === -1) {
				return error(404, "User not found")
			}
			users[index] = {
				...users[index],
				...body
			}

			// return user and sync
			return sync(users[index], {
				upsert: {
					user: {
						filter: {
							id: params.id
						},
						data: users[index]
					}
				}
			})
		},
		{
			body: t.Partial(t.Omit(schema.user, ["id"])),
			params: t.Object({
				id: t.String()
			}),
			response: {
				200: tSync(schema.user),
				404: t.String()
			}
		}
	)

	.use(swagger())

export type App = typeof app

import Elysia, { t } from "elysia"

import sync, { tSync as _tSync } from "../../../src"
import { users } from "../db"
import { keys, schema } from "../schema"

const tSync = _tSync(schema, keys)

export const usersRouter = new Elysia({ prefix: "/users" })
	.use(sync(schema, keys))
	.get(
		"/",
		({ sync }) => {
			return sync(users, {
				user: {
					bulkPut: users
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
		"/",
		({ sync, body }) => {
			// create user
			const user = {
				id: crypto.randomUUID(),
				...body
			}
			users.push(user)

			// return user and sync
			return sync(user, {
				user: {
					put: user
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
		"/:id",
		({ sync, params, error }) => {
			// find user
			const user = users.find((user) => user.id === params.id)
			if (!user) {
				return error(404, "User not found")
			}

			// return user and sync
			return sync(user, {
				user: {
					put: user
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
		"/:id",
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
				user: {
					put: users[index]
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

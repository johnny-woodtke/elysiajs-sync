import Elysia, { t } from "elysia"

import sync, { tSync as _tSync } from "../../../src"
import { users } from "../db"
import { primaryKeys, schema } from "../schema"

const tSync = _tSync(schema, primaryKeys)

export const usersRouter = new Elysia({ prefix: "/users" })
	.use(sync(schema, primaryKeys))
	.get(
		"/",
		({ sync }) => {
			return sync(users, {
				bulkAdd: {
					user: users
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
				add: {
					user: user
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
				put: {
					user: user
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
				add: {
					user: users[index]
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

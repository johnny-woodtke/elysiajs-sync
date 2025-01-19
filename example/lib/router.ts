import { cors } from "@elysiajs/cors"
import { swagger } from "@elysiajs/swagger"
import { Elysia, error, Static, t } from "elysia"

import { tSync as _tSync, sync } from "../../src"
import { todos } from "./db"
import { keys, schema } from "./schema"

const tSync = _tSync(schema, keys)

export const app = new Elysia({ prefix: "/api" })
	.use(cors())
	.use(sync(schema, keys))
	.get(
		"/todos",
		({ sync }) => {
			return sync(todos, {
				todo: {
					bulkPut: [todos, undefined, undefined]
				}
			})
		},
		{
			response: {
				200: tSync(t.Array(schema.todo))
			}
		}
	)
	.post(
		"/todos",
		({ sync, body }) => {
			const todo: Static<typeof schema.todo> = {
				["++id"]: crypto.randomUUID(),
				createdAt: new Date(),
				updatedAt: new Date(),
				...body
			}
			todos.push(todo)

			return sync(todo, {
				todo: {
					add: [todo, undefined]
				}
			})
		},
		{
			body: t.Omit(schema.todo, ["++id", "createdAt", "updatedAt"]),
			response: {
				200: tSync(schema.todo)
			}
		}
	)
	.get(
		"/todos/:id",
		({ sync, params, error }) => {
			const todo = todos.find((todo) => todo["++id"] === params.id)
			if (!todo) {
				return error(404, "Todo not found")
			}

			return sync(todo, {
				todo: {
					put: [todo, undefined]
				}
			})
		},
		{
			params: t.Object({
				id: t.Index(schema.todo, ["++id"])
			}),
			response: {
				200: tSync(schema.todo),
				404: t.String()
			}
		}
	)
	.patch(
		"/todos/:id",
		({ sync, params, body }) => {
			const idx = todos.findIndex((todo) => todo["++id"] === params.id)
			if (idx === -1) {
				return error(404, "Todo not found")
			}

			const updatedTodo = {
				...todos[idx],
				...body,
				updatedAt: new Date()
			}
			todos[idx] = updatedTodo

			return sync(updatedTodo, {
				todo: {
					update: [
						updatedTodo["++id"],
						{
							...body,
							updatedAt: updatedTodo.updatedAt
						}
					]
				}
			})
		},
		{
			params: t.Object({
				id: t.Index(schema.todo, ["++id"])
			}),
			body: t.Partial(t.Omit(schema.todo, ["++id", "createdAt", "updatedAt"])),
			response: {
				200: tSync(schema.todo),
				404: t.String()
			}
		}
	)
	.delete(
		"/todos/:id",
		({ sync, params }) => {
			const idx = todos.findIndex((todo) => todo["++id"] === params.id)
			if (idx === -1) {
				return error(404, "Todo not found")
			}

			const deletedTodo = todos[idx]
			todos.splice(idx, 1)

			return sync(deletedTodo, {
				todo: { delete: [deletedTodo["++id"]] }
			})
		},
		{
			params: t.Object({
				id: t.Index(schema.todo, ["++id"])
			}),
			response: {
				200: tSync(schema.todo),
				404: t.String()
			}
		}
	)
	.use(swagger())

export type App = typeof app

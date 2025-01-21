import { config } from "@/lib/client/schema"
import { cors } from "@elysiajs/cors"
import { swagger } from "@elysiajs/swagger"
import { Elysia, error, Static, t } from "elysia"

import { tSync as _tSync, sync } from "../../../src"
import { todos } from "./db"

const tSync = _tSync(config)

export const app = new Elysia({ prefix: "/api" })
	.use(cors())
	.use(sync(config))
	.post(
		"/todos",
		({ sync, body }) => {
			const todo: Static<typeof config.schema.todo> = {
				id: crypto.randomUUID(),
				createdAt: new Date(),
				updatedAt: new Date(),
				...body
			}
			todos.push(todo)

			return sync(todo, {
				todo: {
					put: [todo, undefined]
				}
			})
		},
		{
			body: t.Object({
				id: t.Optional(t.String()),
				title: t.String(),
				description: t.String(),
				completed: t.Boolean(),
				createdAt: t.Optional(t.Date()),
				updatedAt: t.Optional(t.Date())
			}),
			response: {
				200: tSync(config.schema.todo)
			}
		}
	)
	.get(
		"/todos/:id",
		({ sync, params, error }) => {
			const todo = todos.find((todo) => todo.id === params.id)
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
				id: t.Index(config.schema.todo, ["id"])
			}),
			response: {
				200: tSync(config.schema.todo),
				404: t.String()
			}
		}
	)
	.patch(
		"/todos/:id",
		({ sync, params, body }) => {
			const idx = todos.findIndex((todo) => todo.id === params.id)
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
						updatedTodo.id,
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
				id: t.Index(config.schema.todo, ["id"])
			}),
			body: t.Partial(config.schema.todo),
			response: {
				200: tSync(config.schema.todo),
				404: t.String()
			}
		}
	)
	.delete(
		"/todos/:id",
		({ sync, params }) => {
			const idx = todos.findIndex((todo) => todo.id === params.id)
			if (idx === -1) {
				return error(404, "Todo not found")
			}

			const deletedTodo = todos[idx]
			todos.splice(idx, 1)

			return sync(deletedTodo.id, {
				todo: { delete: [deletedTodo.id] }
			})
		},
		{
			params: t.Object({
				id: t.Index(config.schema.todo, ["id"])
			}),
			response: {
				200: tSync(t.Index(config.schema.todo, ["id"])),
				404: t.String()
			}
		}
	)
	.use(swagger())

export type App = typeof app

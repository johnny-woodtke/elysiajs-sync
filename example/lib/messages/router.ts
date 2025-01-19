import Elysia, { t } from "elysia"

import { tSync as _tSync, sync } from "../../../src"
import { messages } from "../db"
import { keys, schema } from "../schema"

const tSync = _tSync(schema, keys)

export const messagesRouter = new Elysia({ prefix: "/messages" })
	.use(sync(schema, keys))
	.get(
		"/",
		({ sync }) => {
			return sync(messages, {
				message: {
					bulkPut: [messages, undefined, undefined]
				}
			})
		},
		{
			response: {
				200: tSync(t.Array(schema.message))
			}
		}
	)
	.get(
		"/threads/:threadId",
		({ sync, params }) => {
			const threadMessages = messages
				.filter((message) => message.threadId === params.threadId)
				.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
			return sync(messages, {
				message: {
					bulkPut: [threadMessages, undefined, undefined]
				}
			})
		},
		{
			params: t.Object({
				threadId: t.String()
			}),
			response: {
				200: tSync(t.Array(schema.message))
			}
		}
	)
	.post(
		"/threads/:threadId",
		({ sync, body, params }) => {
			const message = {
				id: crypto.randomUUID(),
				createdAt: new Date(),
				threadId: params.threadId,
				...body
			}
			messages.push(message)
			return sync(message, {
				message: {
					put: [message, undefined]
				}
			})
		},
		{
			body: t.Omit(schema.message, ["id", "createdAt", "threadId"]),
			params: t.Object({
				threadId: t.String()
			}),
			response: {
				200: tSync(schema.message)
			}
		}
	)

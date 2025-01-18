import Elysia, { t } from "elysia"

import sync, { tSync as _tSync } from "../../../src"
import { messages } from "../db"
import { primaryKeys, schema } from "../schema"

const tSync = _tSync(schema, primaryKeys)

export const messagesRouter = new Elysia({ prefix: "/messages" })
	.use(sync(schema, primaryKeys))
	.get(
		"/",
		({ sync }) => {
			return sync(messages, {
				bulkAdd: {
					message: messages
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
				bulkAdd: {
					message: threadMessages
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
				add: {
					message: message
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

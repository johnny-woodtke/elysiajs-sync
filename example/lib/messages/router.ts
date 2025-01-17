import Elysia, { t } from "elysia"

import sync, { tSync as _tSync } from "../../../src"
import { messages } from "../db"
import { schema } from "../schema"

const tSync = _tSync(schema)

export const messagesRouter = new Elysia({ prefix: "/messages" })
	.use(sync(schema))
	.get("/", ({ sync }) => {
		return sync(messages, {
			upsert: {
				message: messages.map((message) => ({
					filter: {
						threadId: message.threadId
					},
					data: message
				}))
			}
		})
	})
	.get(
		"/threads/:threadId",
		({ sync, params }) => {
			const threadMessages = messages
				.filter((message) => message.threadId === params.threadId)
				.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
			return sync(messages, {
				upsert: {
					message: threadMessages.map((message) => ({
						filter: {
							threadId: message.threadId
						},
						data: message
					}))
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
				upsert: {
					message: {
						filter: {
							threadId: message.threadId
						},
						data: message
					}
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

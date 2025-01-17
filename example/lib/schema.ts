import { t } from "elysia"

const user = t.Object({
	id: t.String(),
	name: t.String(),
	email: t.String()
})

const message = t.Object({
	id: t.String(),
	userId: t.String(),
	threadId: t.String(),
	role: t.String(),
	content: t.String(),
	createdAt: t.Date()
})

export const schema = {
	message,
	user
}

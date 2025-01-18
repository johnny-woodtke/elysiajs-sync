import { t } from "elysia/type-system"

import { SyncDexieKeys } from "../../src/types"

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

export const keys = {
	message: ["++id" as "id", "userId", "threadId", "role", "createdAt"],
	user: ["++id" as "id", "name", "email"]
} satisfies SyncDexieKeys<typeof schema>

import { t } from "elysia/type-system"

import { SyncDexieKeys, SyncDexieSchema } from "../../src/types"

const todo = t.Object({
	["++id"]: t.String(),
	title: t.String(),
	description: t.String(),
	completed: t.Boolean(),
	createdAt: t.Date(),
	updatedAt: t.Date()
})

export const schema = {
	todo
} satisfies SyncDexieSchema

export const keys = {
	todo: ["++id", "completed", "createdAt", "updatedAt"]
} satisfies SyncDexieKeys<typeof schema>

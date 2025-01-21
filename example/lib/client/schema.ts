import { t } from "elysia/type-system"

import { getSyncConfig } from "../../../src/client"

const todo = t.Object({
	id: t.String(),
	title: t.String(),
	description: t.String(),
	completed: t.Boolean(),
	createdAt: t.Date(),
	updatedAt: t.Date()
})

export const config = getSyncConfig({
	name: "todo-sync",
	schema: {
		todo
	},
	keys: {
		todo: ["id", "completed", "createdAt", "updatedAt"]
	},
	latestVerno: 2,
	previousVersions: [
		{
			verno: 1,
			keys: {
				todo: ["id", "completed"]
			}
		}
	]
})

import { Treaty } from "@elysiajs/eden"
import Dexie, { EntityTable } from "dexie"
import type { Static, TSchema } from "elysia"

import { DeleteSchema, UpdateSchema, UpsertSchema } from "./types"
import { InsertSchema } from "./types"

export class Sync<
	T extends Record<string, TSchema>,
	PK extends {
		[K in keyof T]: keyof Static<T[K]> & string
	},
	TPullResponse,
	TPullSync extends Treaty.TreatyResponse<{
		200: {
			response: TPullResponse
			sync?: {
				insert?: InsertSchema<T>
				update?: UpdateSchema<T>
				upsert?: UpsertSchema<T>
				delete?: DeleteSchema<T>
			}
		}
	}>,
	TPushBody,
	TPushResponse,
	TPushSync extends Treaty.TreatyResponse<{
		200: {
			response: TPushResponse
			sync?: {
				insert?: InsertSchema<T>
				upsert?: UpsertSchema<T>
				update?: UpdateSchema<T>
				delete?: DeleteSchema<T>
			}
		}
	}>
> {
	private schema: T
	private primaryKeys: PK
	private push: (body: TPushBody) => Promise<TPushSync>
	private pull: () => Promise<TPullSync>
	public db: Dexie & {
		[K in keyof T]: EntityTable<Static<T[K]>, PK[K]>
	}

	constructor({
		schema,
		primaryKeys,
		push,
		pull
	}: {
		schema: T
		primaryKeys: PK
		push: (body: TPushBody) => Promise<TPushSync>
		pull: () => Promise<TPullSync>
	}) {
		this.schema = schema
		this.primaryKeys = primaryKeys
		this.push = push
		this.pull = pull

		this.db = new Dexie("sync") as any
		this.db.version(1).stores(
			Object.entries(schema).reduce<{
				[table: string]: string | null
			}>((acc, [table, schema]) => {
				// get all keys
				const keys = Object.keys(schema.properties)

				// remove primaryKey
				const filteredKeys = keys.filter((key) => key !== primaryKeys[table])

				// assign formatted keys and return
				acc[table] = [`++${primaryKeys[table]}`, ...filteredKeys].join(", ")
				return acc
			}, {})
		)
	}
}

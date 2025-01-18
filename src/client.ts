import Dexie, { EntityTable } from "dexie"
import type { Static, TSchema } from "elysia"

import {
	DeleteSchema,
	InsertSchema,
	SyncTreatyResponse,
	UpdateSchema,
	UpsertSchema
} from "./types"

let db: Dexie | null = null

export class Sync<
	T extends Record<string, TSchema>,
	PK extends {
		[K in keyof T]: keyof Static<T[K]> & string
	}
> {
	private schema: T
	private primaryKeys: PK
	public db: ReturnType<typeof this.initDb>

	constructor({ schema, primaryKeys }: { schema: T; primaryKeys: PK }) {
		this.schema = schema
		this.primaryKeys = primaryKeys
		this.db = this.initDb(schema, primaryKeys)
	}

	private initDb(
		schema: T,
		primaryKeys: PK
	): Dexie & {
		[K in keyof T]: EntityTable<Static<T[K]>, PK[K]>
	} {
		if (!db) {
			db = new Dexie("sync")
			db.version(1).stores(
				Object.entries(schema).reduce<{
					[table: string]: string | null
				}>((acc, [table, schema]) => {
					acc[table] = [
						`++${primaryKeys[table]}`,
						...Object.keys(schema.properties).filter(
							(key) => key !== primaryKeys[table]
						)
					].join(", ")
					return acc
				}, {})
			)
		}
		return db as any
	}

	public async fetch<
		TResponse,
		TSyncResponse extends SyncTreatyResponse<T, TResponse>
	>(fn: () => Promise<TSyncResponse>) {
		// fetch from treaty
		const res = await fn()

		// sync to db
		const sync = res.data?.sync
		if (sync) {
			await this.sync(sync)
		}

		// return treaty response
		return res
	}

	private async sync(props: {
		insert?: InsertSchema<T>
		update?: UpdateSchema<T>
		upsert?: UpsertSchema<T>
		delete?: DeleteSchema<T>
	}) {
		for (const [key, schema] of Object.entries(props)) {
			const op = key as "insert" | "update" | "upsert" | "delete"

			for (const [key, data] of Object.entries(schema)) {
				const table = key as keyof T
				const dbTable = this.db[table]
			}
		}
	}
}

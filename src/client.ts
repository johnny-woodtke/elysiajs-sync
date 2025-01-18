import Dexie from "dexie"
import type { TSchema } from "elysia"

import { SyncDexie, SyncDexieKeys, SyncTreatyResponse } from "./types"

let db: Dexie | null = null

export class Sync<
	T extends Record<string, TSchema>,
	U extends SyncDexieKeys<T>
> {
	private schema: T
	private keys: U
	public db: ReturnType<typeof this.initDb>

	constructor({ schema, keys }: { schema: T; keys: U }) {
		this.schema = schema
		this.keys = keys
		this.db = this.initDb(schema, keys)
	}

	private initDb(schema: T, keys: U): SyncDexie<T, U> {
		if (db) {
			return db as SyncDexie<T, U>
		}
		db = new Dexie("sync") as SyncDexie<T, U>
		db.version(1).stores(
			Object.keys(schema).reduce<{
				[table: string]: string | null
			}>((acc, table) => {
				acc[table] = keys[table].join(", ")
				return acc
			}, {})
		)
		return db as SyncDexie<T, U>
	}

	public async fetch<V, W extends SyncTreatyResponse<T, U, V>>(
		callback: () => Promise<W>
	) {
		// execute callback
		const res = await callback()
		console.log("res", res)

		// sync if needed
		// const sync = res.data?.sync
		// console.log("sync", sync)
		// if (sync) {
		// 	for (const [key, data] of Object.entries(sync)) {
		// 		const method = key as keyof typeof sync
		// 		for (const [key, value] of Object.entries(data)) {
		// 			const table = key as keyof T
		// 			console.log("table", table)
		// 			console.log("method", method)
		// 			console.log("value", value)
		// 			const fn = this.db?.[table]?.[method] as any
		// 			await fn?.(value)
		// 		}
		// 	}
		// }

		// return response
		return res
	}
}

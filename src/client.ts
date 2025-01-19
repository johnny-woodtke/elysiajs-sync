import Dexie from "dexie"
import type { TSchema } from "elysia"

import type {
	SyncDexie,
	SyncDexieKeys,
	SyncDexieMethod,
	SyncDexieMethodMap,
	SyncTreatyResponse
} from "./types"

// use a single instance of db
// https://dexie.org/docs/Tutorial/React#3-create-a-file-dbjs-or-dbts
let db: any = null

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
		// Enforce a single instance of db
		if (db) {
			return db
		}

		// Initialize db
		db = new Dexie("sync")

		// Define stores
		const stores = Object.keys(schema).reduce<{
			[table: string]: string | null
		}>((acc, table) => {
			acc[table] = keys[table].join(", ")
			return acc
		}, {})
		db.version(1).stores(stores)

		// Initialize tables immediately after defining schema
		for (const tableName of Object.keys(schema)) {
			db[tableName] = db.table(tableName)
		}

		// Return db
		return db
	}

	public async fetch<V, W extends SyncTreatyResponse<T, U, V>>(
		callback: () => Promise<W>
	) {
		// Execute callback
		const res = await callback()

		// Sync if needed
		const sync = res.data?.sync
		if (sync) {
			await this.sync(sync)
		}

		// Return response
		return res
	}

	private async sync<
		V extends {
			[K in keyof T]?: {
				[K2 in SyncDexieMethod]?: SyncDexieMethodMap<T, U, K2, K>
			}
		}
	>(sync: V) {
		// Initialize transaction
		await db.transaction(
			"rw",
			// Get all tables
			Object.keys(sync).map((key) => db[key]),
			// Execute sync
			async () => {
				// Iterate over each table
				for (const [key, methodsWithArgs] of Object.entries(sync)) {
					const table = db[key]
					// Iterate over each method
					for (const [method, value] of Object.entries(methodsWithArgs)) {
						const dexieMethod = method as SyncDexieMethod
						const args = value as SyncDexieMethodMap<
							T,
							U,
							typeof dexieMethod,
							keyof T
						>
						// Execute method
						await table[dexieMethod](...args)
					}
				}
			}
		)
	}
}

import { Dexie } from "dexie"

import type {
	SyncDexie,
	SyncDexieEntityTable,
	SyncDexieKeys,
	SyncDexieMethod,
	SyncDexieMethodMap,
	SyncDexieSchema,
	SyncTreatyResponse
} from "./types"

// use a single instance of db
// https://dexie.org/docs/Tutorial/React#3-create-a-file-dbjs-or-dbts
let db: any = null

export class Sync<T extends SyncDexieSchema, U extends SyncDexieKeys<T>> {
	private schema: T
	private keys: U
	public db: ReturnType<typeof this.initDb>

	constructor(schema: T, keys: U) {
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
		await this.db.transaction(
			"rw",
			// Get all tables
			Object.keys(sync).map((key: keyof T) => this.db[key]),
			// Execute sync
			async () => {
				// Iterate over each table
				for (const [key, methodsWithArgs] of Object.entries(sync)) {
					const table = this.db[key as keyof T]
					// Iterate over each method
					for (const [method, args] of Object.entries(methodsWithArgs)) {
						// Execute method
						await this.syncMap[method as SyncDexieMethod](table, args as never)
					}
				}
			}
		)
	}

	private syncMap: {
		[K in SyncDexieMethod]: <K2 extends keyof T>(
			table: SyncDexieEntityTable<T, U, K2>,
			args: SyncDexieMethodMap<T, U, K, K2>
		) => Promise<void>
	} = {
		add: async <K extends keyof T>(
			table: SyncDexieEntityTable<T, U, K>,
			args: SyncDexieMethodMap<T, U, "add", K>
		) => {
			await table.add(...args)
		},
		bulkAdd: async <K extends keyof T>(
			table: SyncDexieEntityTable<T, U, K>,
			args: SyncDexieMethodMap<T, U, "bulkAdd", K>
		) => {
			await table.bulkAdd(...args)
		},
		put: async <K extends keyof T>(
			table: SyncDexieEntityTable<T, U, K>,
			args: SyncDexieMethodMap<T, U, "put", K>
		) => {
			await table.put(...args)
		},
		bulkPut: async <K extends keyof T>(
			table: SyncDexieEntityTable<T, U, K>,
			args: SyncDexieMethodMap<T, U, "bulkPut", K>
		) => {
			await table.bulkPut(...args)
		},
		update: async <K extends keyof T>(
			table: SyncDexieEntityTable<T, U, K>,
			args: SyncDexieMethodMap<T, U, "update", K>
		) => {
			await table.update(...args)
		},
		bulkUpdate: async <K extends keyof T>(
			table: SyncDexieEntityTable<T, U, K>,
			args: SyncDexieMethodMap<T, U, "bulkUpdate", K>
		) => {
			await table.bulkUpdate(...args)
		},
		delete: async <K extends keyof T>(
			table: SyncDexieEntityTable<T, U, K>,
			args: SyncDexieMethodMap<T, U, "delete", K>
		) => {
			await table.delete(...args)
		},
		bulkDelete: async <K extends keyof T>(
			table: SyncDexieEntityTable<T, U, K>,
			args: SyncDexieMethodMap<T, U, "bulkDelete", K>
		) => {
			await table.bulkDelete(...args)
		}
	}
}

import { Dexie } from "dexie"

import type {
	NonNegativeInteger,
	SyncConfig,
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
let db: Dexie | null = null

export class Sync<
	T extends SyncDexieSchema,
	U extends SyncDexieKeys<T>,
	V extends number,
	W extends NonNegativeInteger<V>,
	X extends string
> {
	private config: SyncConfig<T, U, V, W, X>

	constructor(config: SyncConfig<T, U, V, W, X>) {
		this.config = config
	}

	public getDb(): SyncDexie<T, U> {
		if (db) {
			return db as SyncDexie<T, U>
		}
		return this.initDb(this.config)
	}

	private initDb(config: SyncConfig<T, U, V, W, X>): SyncDexie<T, U> {
		// Initialize db
		db = new Dexie(config.name)

		// Define previous versions
		for (const version of config.previousVersions) {
			db.version(version.verno)
				.stores(this.convertKeysToStores(version.keys))
				.upgrade(async (trans) => {
					await version.upgrade?.(trans)
				})
		}

		// Define current version
		db.version(config.latestVerno)
			.stores(this.convertKeysToStores(config.keys))
			.upgrade(async (trans) => {
				await config.upgrade?.(trans)
			})

		// Initialize tables
		const temp: any = db
		for (const tableName of Object.keys(config.keys)) {
			temp[tableName] = db.table(tableName)
		}
		db = temp

		// Return db
		return db as SyncDexie<T, U>
	}

	private convertKeysToStores(
		keys: Record<string, string[]>
	): Record<string, string> {
		return Object.entries(keys).reduce<Record<string, string>>(
			(acc, [table, keys]) => {
				acc[table] = keys.join(", ")
				return acc
			},
			{}
		)
	}

	public async fetch<V, W extends SyncTreatyResponse<T, U, V>>(
		callback: () => Promise<W>
	): Promise<W> {
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
	>(sync: V): Promise<void> {
		// Get db
		const db = this.getDb()

		// Initialize transaction
		await db.transaction(
			"rw",
			// Get all tables
			Object.keys(sync).map((key: keyof T) => db[key]),
			// Execute sync
			async () => {
				// Iterate over each table
				for (const [key, methodsWithArgs] of Object.entries(sync)) {
					const table = db[key as keyof T]
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

export function getSyncConfig<
	T extends SyncDexieSchema,
	U extends SyncDexieKeys<T>,
	V extends number,
	W extends NonNegativeInteger<V>,
	X extends string
>(props: SyncConfig<T, U, V, W, X>) {
	return props
}

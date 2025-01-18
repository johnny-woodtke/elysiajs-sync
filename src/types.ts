import { Treaty } from "@elysiajs/eden"
import { TArray, TObject, TString } from "@sinclair/typebox"
import Dexie, { EntityTable } from "dexie"
import type { Static, TSchema } from "elysia"

/**
 * Primary key of the table
 */
export type SyncDexieKeys<T extends Record<string, TSchema>> = {
	[K in keyof T]: [
		string & keyof Static<T[K]>,
		...(string & keyof Static<T[K]>)[]
	]
}

/**
 * Supported Dexie methods
 */
export type SyncDexieMethod =
	| "add"
	| "bulkAdd"
	| "put"
	| "bulkPut"
	| "delete"
	| "bulkDelete"

/**
 * Dexie DB containing all tables and their schemas, specified primary keys
 */
export type SyncDexie<
	T extends Record<string, TSchema>,
	U extends SyncDexieKeys<T>
> = Dexie & {
	[K in keyof T]: EntityTable<Static<T[K]>, U[K][0]>
}

/**
 * Parameters for adding a single item to a Dexie table
 */
export type SyncDexieAdd<
	T extends Record<string, TSchema>,
	U extends SyncDexieKeys<T>,
	V extends keyof T
> = Parameters<SyncDexie<T, U>[V]["add"]>[0]

/**
 * Typebox equivalent of SyncDexieAdd
 */
export type tSyncDexieAdd<
	T extends Record<string, TSchema>,
	U extends SyncDexieKeys<T>,
	V extends keyof T
> = TObject<SyncDexieAdd<T, U, V>>

/**
 * Parameters for adding multiple items to a Dexie table
 */
export type SyncDexieBulkAdd<
	T extends Record<string, TSchema>,
	U extends SyncDexieKeys<T>,
	V extends keyof T
> = SyncDexieAdd<T, U, V>[]

/**
 * Typebox equivalent of SyncDexieBulkAdd
 */
export type tSyncDexieBulkAdd<
	T extends Record<string, TSchema>,
	U extends SyncDexieKeys<T>,
	V extends keyof T
> = TArray<tSyncDexieAdd<T, U, V>>

/**
 * Parameters for putting a single item into a Dexie table
 */
export type SyncDexiePut<
	T extends Record<string, TSchema>,
	U extends SyncDexieKeys<T>,
	V extends keyof T
> = Parameters<SyncDexie<T, U>[V]["put"]>[0]

/**
 * Typebox equivalent of SyncDexiePut
 */
export type tSyncDexiePut<
	T extends Record<string, TSchema>,
	U extends SyncDexieKeys<T>,
	V extends keyof T
> = TObject<SyncDexiePut<T, U, V>>

/**
 * Parameters for putting multiple items into a Dexie table
 */
export type SyncDexieBulkPut<
	T extends Record<string, TSchema>,
	U extends SyncDexieKeys<T>,
	V extends keyof T
> = SyncDexiePut<T, U, V>[]

/**
 * Typebox equivalent of SyncDexieBulkPut
 */
export type tSyncDexieBulkPut<
	T extends Record<string, TSchema>,
	U extends SyncDexieKeys<T>,
	V extends keyof T
> = TArray<tSyncDexiePut<T, U, V>>

/**
 * Parameters for deleting a single item from a Dexie table
 */
export type SyncDexieDelete<
	T extends Record<string, TSchema>,
	U extends SyncDexieKeys<T>,
	V extends keyof T
> = Parameters<SyncDexie<T, U>[V]["delete"]>[0]

/**
 * Typebox equivalent of SyncDexieDelete
 */
export type tSyncDexieDelete<
	T extends Record<string, TSchema>,
	U extends SyncDexieKeys<T>,
	V extends keyof T
> = TString

/**
 * Parameters for deleting multiple items from a Dexie table
 */
export type SyncDexieBulkDelete<
	T extends Record<string, TSchema>,
	U extends SyncDexieKeys<T>,
	V extends keyof T
> = Parameters<SyncDexie<T, U>[V]["bulkDelete"]>[0]

/**
 * Typebox equivalent of SyncDexieBulkDelete
 */
export type tSyncDexieBulkDelete<
	T extends Record<string, TSchema>,
	U extends SyncDexieKeys<T>,
	V extends keyof T
> = TArray<tSyncDexieDelete<T, U, V>>

/**
 * Map of Dexie methods to their parameters
 */
export type SyncDexieMethodMap<
	T extends Record<string, TSchema>,
	U extends SyncDexieKeys<T>,
	V extends SyncDexieMethod,
	W extends keyof T
> = {
	add: SyncDexieAdd<T, U, W>
	bulkAdd: SyncDexieBulkAdd<T, U, W>
	put: SyncDexiePut<T, U, W>
	bulkPut: SyncDexieBulkPut<T, U, W>
	delete: SyncDexieDelete<T, U, W>
	bulkDelete: SyncDexieBulkDelete<T, U, W>
}[V]

/**
 * Map of Dexie methods to their Typebox equivalent parameters
 */
export type tSyncDexieMethodMap<
	T extends Record<string, TSchema>,
	U extends SyncDexieKeys<T>,
	V extends SyncDexieMethod,
	W extends keyof T
> = {
	add: tSyncDexieAdd<T, U, W>
	bulkAdd: tSyncDexieBulkAdd<T, U, W>
	put: tSyncDexiePut<T, U, W>
	bulkPut: tSyncDexieBulkPut<T, U, W>
	delete: tSyncDexieDelete<T, U, W>
	bulkDelete: tSyncDexieBulkDelete<T, U, W>
}[V]

/**
 * Response from a Treaty request with sync options
 */
export type SyncTreatyResponse<
	T extends Record<string, TSchema>,
	U extends SyncDexieKeys<T>,
	V
> = Treaty.TreatyResponse<{
	200: {
		response: V
		sync?: {
			[K in keyof T]?: {
				[K2 in SyncDexieMethod]?: SyncDexieMethodMap<T, U, K2, K>
			}
		}
	}
}>

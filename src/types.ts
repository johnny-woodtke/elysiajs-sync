import { Treaty } from "@elysiajs/eden"
import { TArray, TObject, TString } from "@sinclair/typebox"
import Dexie, { EntityTable } from "dexie"
import { Static, TSchema } from "elysia"

/**
 * Primary key of the table
 */
export type PrimaryKey<T extends Record<string, TSchema>> = {
	[K in keyof T]: keyof Static<T[K]> & string
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
	U extends PrimaryKey<T>
> = Dexie & {
	[K in keyof T]: EntityTable<Static<T[K]>, U[K]>
}

/**
 * Parameters for adding a single item to a Dexie table
 */
export type SyncDexieAdd<
	T extends Record<string, TSchema>,
	U extends PrimaryKey<T>,
	V extends keyof T
> = Parameters<SyncDexie<T, U>[V]["add"]>[0]

/**
 * Typebox equivalent of SyncDexieAdd
 */
export type tSyncDexieAdd<
	T extends Record<string, TSchema>,
	U extends PrimaryKey<T>,
	V extends keyof T
> = TObject<SyncDexieAdd<T, U, V>>

/**
 * Parameters for adding multiple items to a Dexie table
 */
export type SyncDexieBulkAdd<
	T extends Record<string, TSchema>,
	U extends PrimaryKey<T>,
	V extends keyof T
> = SyncDexieAdd<T, U, V>[]

/**
 * Typebox equivalent of SyncDexieBulkAdd
 */
export type tSyncDexieBulkAdd<
	T extends Record<string, TSchema>,
	U extends PrimaryKey<T>,
	V extends keyof T
> = TArray<tSyncDexieAdd<T, U, V>>

/**
 * Parameters for putting a single item into a Dexie table
 */
export type SyncDexiePut<
	T extends Record<string, TSchema>,
	U extends PrimaryKey<T>,
	V extends keyof T
> = Parameters<SyncDexie<T, U>[V]["put"]>[0]

/**
 * Typebox equivalent of SyncDexiePut
 */
export type tSyncDexiePut<
	T extends Record<string, TSchema>,
	U extends PrimaryKey<T>,
	V extends keyof T
> = TObject<SyncDexiePut<T, U, V>>

/**
 * Parameters for putting multiple items into a Dexie table
 */
export type SyncDexieBulkPut<
	T extends Record<string, TSchema>,
	U extends PrimaryKey<T>,
	V extends keyof T
> = SyncDexiePut<T, U, V>[]

/**
 * Typebox equivalent of SyncDexieBulkPut
 */
export type tSyncDexieBulkPut<
	T extends Record<string, TSchema>,
	U extends PrimaryKey<T>,
	V extends keyof T
> = TArray<tSyncDexiePut<T, U, V>>

/**
 * Parameters for deleting a single item from a Dexie table
 */
export type SyncDexieDelete<
	T extends Record<string, TSchema>,
	U extends PrimaryKey<T>,
	V extends keyof T
> = Parameters<SyncDexie<T, U>[V]["delete"]>[0]

/**
 * Typebox equivalent of SyncDexieDelete
 */
export type tSyncDexieDelete<
	T extends Record<string, TSchema>,
	U extends PrimaryKey<T>,
	V extends keyof T
> = TString

/**
 * Parameters for deleting multiple items from a Dexie table
 */
export type SyncDexieBulkDelete<
	T extends Record<string, TSchema>,
	U extends PrimaryKey<T>,
	V extends keyof T
> = Parameters<SyncDexie<T, U>[V]["bulkDelete"]>[0]

/**
 * Typebox equivalent of SyncDexieBulkDelete
 */
export type tSyncDexieBulkDelete<
	T extends Record<string, TSchema>,
	U extends PrimaryKey<T>,
	V extends keyof T
> = TArray<tSyncDexieDelete<T, U, V>>

/**
 * Response from a Treaty request with sync options
 */
export type SyncTreatyResponse<
	T extends Record<string, TSchema>,
	U extends PrimaryKey<T>,
	V
> = Treaty.TreatyResponse<{
	200: {
		response: V
		sync?: {
			add?: {
				[K in keyof T]?: SyncDexieAdd<T, U, K>
			}
			bulkAdd?: {
				[K in keyof T]?: SyncDexieBulkAdd<T, U, K>
			}
			put?: {
				[K in keyof T]?: SyncDexiePut<T, U, K>
			}
			bulkPut?: {
				[K in keyof T]?: SyncDexieBulkPut<T, U, K>
			}
			delete?: {
				[K in keyof T]?: SyncDexieDelete<T, U, K>
			}
			bulkDelete?: {
				[K in keyof T]?: SyncDexieBulkDelete<T, U, K>
			}
		}
	}
}>

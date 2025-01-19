import type { Treaty } from "@elysiajs/eden"
import type {
	TArray,
	TObject,
	TTuple,
	TBoolean,
	TPartial,
	TUnion,
	TUndefined,
	TIndex
} from "@sinclair/typebox"
import Dexie, {
	type IDType,
	type IndexableTypePart,
	type UpdateSpec,
	type EntityTable
} from "dexie"
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
	| "update"
	| "bulkUpdate"
	| "delete"
	| "bulkDelete"

/**
 * Entity table with primary key
 */
export type SyncDexieEntityTable<
	T extends Record<string, TSchema>,
	U extends SyncDexieKeys<T>,
	V extends keyof T
> = EntityTable<Static<T[V]>, U[V][0]>

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
> = [Static<T[V]>, IDType<Static<T[V]>, U[V][0]> | undefined]

/**
 * Typebox equivalent of SyncDexieAdd
 */
export type tSyncDexieAdd<
	T extends Record<string, TSchema>,
	U extends SyncDexieKeys<T>,
	V extends keyof T
> = TTuple<[T[V], TUnion<[TIndex<T[V], [U[V][0]]>, TUndefined]>]>

/**
 * Parameters for adding multiple items to a Dexie table
 */
export type SyncDexieBulkAdd<
	T extends Record<string, TSchema>,
	U extends SyncDexieKeys<T>,
	V extends keyof T
> = [
	Static<T[V]>[],
	IndexableTypePart[] | undefined,
	{ allKeys: boolean } | undefined
]

/**
 * Typebox equivalent of SyncDexieBulkAdd
 */
export type tSyncDexieBulkAdd<
	T extends Record<string, TSchema>,
	U extends SyncDexieKeys<T>,
	V extends keyof T
> = TTuple<
	[
		TArray<T[V]>,
		TUnion<[TArray<TIndex<T[V], [U[V][0]]>>, TUndefined]>,
		TUnion<[TObject<{ allKeys: TBoolean }>, TUndefined]>
	]
>

/**
 * Parameters for putting a single item into a Dexie table
 */
export type SyncDexiePut<
	T extends Record<string, TSchema>,
	U extends SyncDexieKeys<T>,
	V extends keyof T
> = [Static<T[V]>, IDType<Static<T[V]>, U[V][0]> | undefined]

/**
 * Typebox equivalent of SyncDexiePut
 */
export type tSyncDexiePut<
	T extends Record<string, TSchema>,
	U extends SyncDexieKeys<T>,
	V extends keyof T
> = TTuple<[T[V], TUnion<[TIndex<T[V], [U[V][0]]>, TUndefined]>]>

/**
 * Parameters for putting multiple items into a Dexie table
 */
export type SyncDexieBulkPut<
	T extends Record<string, TSchema>,
	U extends SyncDexieKeys<T>,
	V extends keyof T
> = [
	Static<T[V]>[],
	IndexableTypePart[] | undefined,
	{ allKeys: boolean } | undefined
]

/**
 * Typebox equivalent of SyncDexieBulkPut
 */
export type tSyncDexieBulkPut<
	T extends Record<string, TSchema>,
	U extends SyncDexieKeys<T>,
	V extends keyof T
> = TTuple<
	[
		TArray<T[V]>,
		TUnion<[TArray<T[V]["properties"][U[V][0]]>, TUndefined]>,
		TUnion<[TObject<{ allKeys: TBoolean }>, TUndefined]>
	]
>

/**
 * Parameters for updating a single item in a Dexie table
 */
export type SyncDexieUpdate<
	T extends Record<string, TSchema>,
	U extends SyncDexieKeys<T>,
	V extends keyof T
> = [IDType<Static<T[V]>, U[V][0]>, UpdateSpec<Static<T[V]>>]

/**
 * Typebox equivalent of SyncDexieUpdate
 */
export type tSyncDexieUpdate<
	T extends Record<string, TSchema>,
	U extends SyncDexieKeys<T>,
	V extends keyof T
> = TTuple<[TIndex<T[V], [U[V][0]]>, TPartial<T[V]>]>

/**
 * Parameters for updating multiple items in a Dexie table
 */
export type SyncDexieBulkUpdate<
	T extends Record<string, TSchema>,
	U extends SyncDexieKeys<T>,
	V extends keyof T
> = [
	{
		key: IDType<Static<T[V]>, U[V][0]>
		changes: UpdateSpec<Static<T[V]>>
	}[]
]

/**
 * Typebox equivalent of SyncDexieBulkUpdate
 */
export type tSyncDexieBulkUpdate<
	T extends Record<string, TSchema>,
	U extends SyncDexieKeys<T>,
	V extends keyof T
> = TTuple<
	[
		TArray<
			TObject<{ key: T[V]["properties"][U[V][0]]; changes: TPartial<T[V]> }>
		>
	]
>

/**
 * Parameters for deleting a single item from a Dexie table
 */
export type SyncDexieDelete<
	T extends Record<string, TSchema>,
	U extends SyncDexieKeys<T>,
	V extends keyof T
> = [IDType<Static<T[V]>, U[V][0]>]

/**
 * Typebox equivalent of SyncDexieDelete
 */
export type tSyncDexieDelete<
	T extends Record<string, TSchema>,
	U extends SyncDexieKeys<T>,
	V extends keyof T
> = TTuple<[TIndex<T[V], [U[V][0]]>]>

/**
 * Parameters for deleting multiple items from a Dexie table
 */
export type SyncDexieBulkDelete<
	T extends Record<string, TSchema>,
	U extends SyncDexieKeys<T>,
	V extends keyof T
> = [IDType<Static<T[V]>, U[V][0]>[]]

/**
 * Typebox equivalent of SyncDexieBulkDelete
 */
export type tSyncDexieBulkDelete<
	T extends Record<string, TSchema>,
	U extends SyncDexieKeys<T>,
	V extends keyof T
> = TTuple<[TArray<TIndex<T[V], [U[V][0]]>>]>

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
	update: SyncDexieUpdate<T, U, W>
	bulkUpdate: SyncDexieBulkUpdate<T, U, W>
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
	update: tSyncDexieUpdate<T, U, W>
	bulkUpdate: tSyncDexieBulkUpdate<T, U, W>
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

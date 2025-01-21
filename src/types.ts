import type { Treaty } from "@elysiajs/eden"
import type {
	TArray,
	TBoolean,
	TIndex,
	TObject,
	TPartial,
	TTuple,
	TUndefined,
	TUnion
} from "@sinclair/typebox"
import type {
	Dexie,
	EntityTable,
	IDType,
	IndexableTypePart,
	Transaction,
	UpdateSpec
} from "dexie"
import type { Static, TSchema } from "elysia"

/**
 * Schema of the Dexie DB
 */
export type SyncDexieSchema = Record<string, TSchema>

/**
 * Indexes of the schema's tables
 */
export type SyncDexieKeys<T extends SyncDexieSchema> = {
	[K in keyof T]: [
		string & keyof Static<T[K]>,
		...(string & keyof Static<T[K]>)[]
	]
}

type Enumerate<
	N extends number,
	Acc extends number[] = []
> = Acc["length"] extends N
	? Acc[number]
	: Enumerate<N, [...Acc, Acc["length"]]>

type Range<F extends number, T extends number> = Exclude<
	Enumerate<T>,
	Enumerate<F>
>

/**
 * Previous versions of the Dexie DB
 *
 * @link https://dexie.org/docs/Version/Version.upgrade()
 * @link https://dexie.org/docs/Tutorial/Design#database-versioning
 */
export type SyncDexiePreviousVersion<T extends number> = {
	verno: Range<1, T>
	keys: Record<string, string[]>
	upgrade?: (trans: Transaction) => Promise<void>
}

/**
 * Helper type to ensure that the latest version number is a non-negative integer
 */
export type NonNegativeInteger<T extends number> = `${T}` extends
	| `-${string}`
	| `${string}.${string}`
	? never
	: T

/**
 * Configuration for the sync plugin
 */
export type SyncConfig<
	T extends SyncDexieSchema,
	U extends SyncDexieKeys<T>,
	V extends number,
	W extends NonNegativeInteger<V>,
	X extends string
> = {
	name: X
	schema: T
	keys: U
	latestVerno: W
	upgrade?: (trans: Transaction) => Promise<void>
	previousVersions: SyncDexiePreviousVersion<W>[]
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
	T extends SyncDexieSchema,
	U extends SyncDexieKeys<T>,
	V extends keyof T
> = EntityTable<Static<T[V]>, U[V][0]>

/**
 * Dexie DB containing all tables and their schemas, specified primary keys
 */
export type SyncDexie<
	T extends SyncDexieSchema,
	U extends SyncDexieKeys<T>
> = Dexie & {
	[K in keyof T]: EntityTable<Static<T[K]>, U[K][0]>
}

/**
 * Parameters for adding a single item to a Dexie table
 */
export type SyncDexieAdd<
	T extends SyncDexieSchema,
	U extends SyncDexieKeys<T>,
	V extends keyof T
> = [Static<T[V]>, IDType<Static<T[V]>, U[V][0]> | undefined]

/**
 * Typebox equivalent of SyncDexieAdd
 */
export type tSyncDexieAdd<
	T extends SyncDexieSchema,
	U extends SyncDexieKeys<T>,
	V extends keyof T
> = TTuple<[T[V], TUnion<[TIndex<T[V], [U[V][0]]>, TUndefined]>]>

/**
 * Parameters for adding multiple items to a Dexie table
 */
export type SyncDexieBulkAdd<
	T extends SyncDexieSchema,
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
	T extends SyncDexieSchema,
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
	T extends SyncDexieSchema,
	U extends SyncDexieKeys<T>,
	V extends keyof T
> = [Static<T[V]>, IDType<Static<T[V]>, U[V][0]> | undefined]

/**
 * Typebox equivalent of SyncDexiePut
 */
export type tSyncDexiePut<
	T extends SyncDexieSchema,
	U extends SyncDexieKeys<T>,
	V extends keyof T
> = TTuple<[T[V], TUnion<[TIndex<T[V], [U[V][0]]>, TUndefined]>]>

/**
 * Parameters for putting multiple items into a Dexie table
 */
export type SyncDexieBulkPut<
	T extends SyncDexieSchema,
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
	T extends SyncDexieSchema,
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
 * Parameters for updating a single item in a Dexie table
 */
export type SyncDexieUpdate<
	T extends SyncDexieSchema,
	U extends SyncDexieKeys<T>,
	V extends keyof T
> = [IDType<Static<T[V]>, U[V][0]>, UpdateSpec<Static<T[V]>>]

/**
 * Typebox equivalent of SyncDexieUpdate
 */
export type tSyncDexieUpdate<
	T extends SyncDexieSchema,
	U extends SyncDexieKeys<T>,
	V extends keyof T
> = TTuple<[TIndex<T[V], [U[V][0]]>, TPartial<T[V]>]>

/**
 * Parameters for updating multiple items in a Dexie table
 */
export type SyncDexieBulkUpdate<
	T extends SyncDexieSchema,
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
	T extends SyncDexieSchema,
	U extends SyncDexieKeys<T>,
	V extends keyof T
> = TTuple<
	[
		TArray<
			TObject<{
				// need to use properties syntax because
				// type is too deep for TIndex<T[V], [U[V][0]]>
				key: T[V]["properties"][U[V][0]]
				changes: TPartial<T[V]>
			}>
		>
	]
>

/**
 * Parameters for deleting a single item from a Dexie table
 */
export type SyncDexieDelete<
	T extends SyncDexieSchema,
	U extends SyncDexieKeys<T>,
	V extends keyof T
> = [IDType<Static<T[V]>, U[V][0]>]

/**
 * Typebox equivalent of SyncDexieDelete
 */
export type tSyncDexieDelete<
	T extends SyncDexieSchema,
	U extends SyncDexieKeys<T>,
	V extends keyof T
> = TTuple<[TIndex<T[V], [U[V][0]]>]>

/**
 * Parameters for deleting multiple items from a Dexie table
 */
export type SyncDexieBulkDelete<
	T extends SyncDexieSchema,
	U extends SyncDexieKeys<T>,
	V extends keyof T
> = [IDType<Static<T[V]>, U[V][0]>[]]

/**
 * Typebox equivalent of SyncDexieBulkDelete
 */
export type tSyncDexieBulkDelete<
	T extends SyncDexieSchema,
	U extends SyncDexieKeys<T>,
	V extends keyof T
> = TTuple<[TArray<TIndex<T[V], [U[V][0]]>>]>

/**
 * Map of Dexie methods to their parameters
 */
export type SyncDexieMethodMap<
	T extends SyncDexieSchema,
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
	T extends SyncDexieSchema,
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
	T extends SyncDexieSchema,
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

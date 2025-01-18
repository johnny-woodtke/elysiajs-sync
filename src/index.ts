import { TOptional } from "@sinclair/typebox"
import Elysia, { t, TSchema } from "elysia"

import "./types"
import {
	PrimaryKey,
	SyncDexieAdd,
	SyncDexieBulkAdd,
	SyncDexieBulkDelete,
	SyncDexieBulkPut,
	SyncDexieDelete,
	SyncDexiePut,
	tSyncDexieAdd,
	tSyncDexieBulkAdd,
	tSyncDexieBulkDelete,
	tSyncDexieBulkPut,
	tSyncDexieDelete,
	tSyncDexiePut
} from "./types"

export default function sync<
	T extends Record<string, TSchema>,
	U extends PrimaryKey<T>
>(schema: T, primaryKeys: U) {
	return new Elysia().decorate("sync", function responseWithSync<
		V,
		W extends
			| {
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
			| undefined
	>(response: V, props?: W) {
		return {
			response,
			...(props && { sync: props })
		}
	})
}

export function tSync<
	T extends Record<string, TSchema>,
	U extends PrimaryKey<T>
>(schema: T, primaryKeys: U) {
	const tables = Object.keys(schema) as (keyof T)[]

	const tAdd = tables.reduce(
		(acc, table) => {
			acc[table] = t.Optional(schema[table]) as any
			return acc
		},
		{} as {
			[K in keyof T]: TOptional<tSyncDexieAdd<T, U, K>>
		}
	)

	const tBulkAdd = tables.reduce(
		(acc, table) => {
			acc[table] = t.Optional(t.Array(schema[table])) as any
			return acc
		},
		{} as {
			[K in keyof T]: TOptional<tSyncDexieBulkAdd<T, U, K>>
		}
	)

	const tPut = tables.reduce(
		(acc, table) => {
			acc[table] = t.Optional(schema[table]) as any
			return acc
		},
		{} as {
			[K in keyof T]: TOptional<tSyncDexiePut<T, U, K>>
		}
	)

	const tBulkPut = tables.reduce(
		(acc, table) => {
			acc[table] = t.Optional(t.Array(schema[table])) as any
			return acc
		},
		{} as {
			[K in keyof T]: TOptional<tSyncDexieBulkPut<T, U, K>>
		}
	)

	const tDelete = tables.reduce(
		(acc, table) => {
			acc[table] = t.Optional(t.String()) as any
			return acc
		},
		{} as {
			[K in keyof T]: TOptional<tSyncDexieDelete<T, U, K>>
		}
	)

	const tBulkDelete = tables.reduce(
		(acc, table) => {
			acc[table] = t.Optional(t.Array(t.String())) as any
			return acc
		},
		{} as {
			[K in keyof T]: TOptional<tSyncDexieBulkDelete<T, U, K>>
		}
	)

	return function tResponseWithSync<V extends TSchema>(response: V) {
		return t.Object({
			response,
			sync: t.Optional(
				t.Object({
					add: t.Optional(t.Object(tAdd)),
					bulkAdd: t.Optional(t.Object(tBulkAdd)),
					put: t.Optional(t.Object(tPut)),
					bulkPut: t.Optional(t.Object(tBulkPut)),
					delete: t.Optional(t.Object(tDelete)),
					bulkDelete: t.Optional(t.Object(tBulkDelete))
				})
			)
		})
	}
}

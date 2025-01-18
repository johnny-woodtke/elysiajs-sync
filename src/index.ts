import { TOptional, TObject } from "@sinclair/typebox"
import Elysia, { t, TSchema } from "elysia"

import {
	SyncDexieKeys,
	SyncDexieMethod,
	SyncDexieMethodMap,
	tSyncDexieMethodMap
} from "./types"

export default function sync<
	T extends Record<string, TSchema>,
	U extends SyncDexieKeys<T>
>(schema: T, primaryKeys: U) {
	return new Elysia().decorate("sync", function responseWithSync<
		V,
		W extends
			| {
					[K in keyof T]?: {
						[K2 in SyncDexieMethod]?: SyncDexieMethodMap<T, U, K2, K>
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
	U extends SyncDexieKeys<T>
>(schema: T, keys: U) {
	const tSync = (Object.keys(schema) as (keyof T)[]).reduce(
		(acc, table) => {
			acc[table] = t.Optional(
				t.Object({
					add: t.Optional(schema[table]),
					bulkAdd: t.Optional(t.Array(schema[table])),
					put: t.Optional(schema[table]),
					bulkPut: t.Optional(t.Array(schema[table])),
					delete: t.Optional(t.String()),
					bulkDelete: t.Optional(t.Array(t.String()))
				})
			) as any
			return acc
		},
		{} as {
			[K in keyof T]: TOptional<
				TObject<{
					[K2 in SyncDexieMethod]: TOptional<tSyncDexieMethodMap<T, U, K2, K>>
				}>
			>
		}
	)

	return function tResponseWithSync<V extends TSchema>(response: V) {
		return t.Object({
			response,
			sync: t.Optional(t.Object(tSync))
		})
	}
}

import type { TOptional, TObject } from "@sinclair/typebox"
import Elysia, { t, type TSchema } from "elysia"

import type {
	SyncDexieKeys,
	SyncDexieMethod,
	SyncDexieMethodMap,
	tSyncDexieMethodMap
} from "./types"

export default function sync<
	T extends Record<string, TSchema>,
	U extends SyncDexieKeys<T>
>(schema: T, keys: U) {
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
					add: t.Optional(
						t.Tuple([schema[table], t.Union([t.String(), t.Undefined()])])
					),
					bulkAdd: t.Optional(
						t.Tuple([
							t.Array(schema[table]),
							t.Union([t.Array(t.String()), t.Undefined()]),
							t.Union([t.Object({ allKeys: t.Boolean() }), t.Undefined()])
						])
					),
					put: t.Optional(
						t.Tuple([schema[table], t.Union([t.String(), t.Undefined()])])
					),
					bulkPut: t.Optional(
						t.Tuple([
							t.Array(schema[table]),
							t.Union([t.Array(t.String()), t.Undefined()]),
							t.Union([t.Object({ allKeys: t.Boolean() }), t.Undefined()])
						])
					),
					update: t.Optional(t.Tuple([t.String(), t.Partial(schema[table])])),
					bulkUpdate: t.Optional(
						t.Array(
							t.Object({
								key: t.String(),
								changes: t.Partial(schema[table])
							})
						)
					),
					delete: t.Optional(t.Tuple([t.String()])),
					bulkDelete: t.Optional(t.Tuple([t.Array(t.String())]))
				})
			)
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

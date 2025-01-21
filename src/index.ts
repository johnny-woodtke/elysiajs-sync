import type { TObject, TOptional } from "@sinclair/typebox"
import { Elysia, t, type TSchema } from "elysia"

import type {
	NonNegativeInteger,
	SyncConfig,
	SyncDexieKeys,
	SyncDexieMethod,
	SyncDexieMethodMap,
	SyncDexieSchema,
	tSyncDexieMethodMap
} from "./types"

export function sync<
	T extends SyncDexieSchema,
	U extends SyncDexieKeys<T>,
	V extends number,
	W extends NonNegativeInteger<V>,
	X extends string
>(config: SyncConfig<T, U, V, W, X>) {
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
			sync: props
		}
	})
}

export function tSync<
	T extends SyncDexieSchema,
	U extends SyncDexieKeys<T>,
	V extends number,
	W extends NonNegativeInteger<V>,
	X extends string
>({ schema, keys }: SyncConfig<T, U, V, W, X>) {
	const tSync = (Object.keys(schema) as (keyof T)[]).reduce(
		(acc, table) => {
			acc[table] = t.Optional(
				t.Object({
					add: t.Optional(
						t.Tuple([
							schema[table],
							t.Union([t.Index(schema[table], [keys[table][0]]), t.Undefined()])
						])
					),
					bulkAdd: t.Optional(
						t.Tuple([
							t.Array(schema[table]),
							t.Union([
								t.Array(t.Index(schema[table], [keys[table][0]])),
								t.Undefined()
							]),
							t.Union([t.Object({ allKeys: t.Boolean() }), t.Undefined()])
						])
					),
					put: t.Optional(
						t.Tuple([
							schema[table],
							t.Union([t.Index(schema[table], [keys[table][0]]), t.Undefined()])
						])
					),
					bulkPut: t.Optional(
						t.Tuple([
							t.Array(schema[table]),
							t.Union([
								t.Array(t.Index(schema[table], [keys[table][0]])),
								t.Undefined()
							]),
							t.Union([t.Object({ allKeys: t.Boolean() }), t.Undefined()])
						])
					),
					update: t.Optional(
						t.Tuple([
							t.Index(schema[table], [keys[table][0]]),
							t.Partial(schema[table])
						])
					),
					bulkUpdate: t.Optional(
						t.Tuple([
							t.Array(
								t.Object({
									key: t.Index(schema[table], [
										keys[table][0]
									]) as T[typeof table]["properties"][U[typeof table][0]],
									changes: t.Partial(schema[table])
								})
							)
						])
					),
					delete: t.Optional(
						t.Tuple([t.Index(schema[table], [keys[table][0]])])
					),
					bulkDelete: t.Optional(
						t.Tuple([t.Array(t.Index(schema[table], [keys[table][0]]))])
					)
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

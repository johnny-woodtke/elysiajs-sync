import { Treaty } from "@elysiajs/eden"
import Elysia, { t, TSchema } from "elysia"

import {
	DeleteSchema,
	InsertSchema,
	tDeleteSchema,
	tInsertSchema,
	tUpdateSchema,
	UpdateSchema
} from "./types"

export default function sync<T extends Record<string, TSchema>>(schema: T) {
	return new Elysia().decorate("sync", function responseWithSync<
		U,
		V extends
			| {
					insert?: InsertSchema<T>
					delete?: DeleteSchema<T>
					update?: UpdateSchema<T>
			  }
			| undefined
	>(response: U, props?: V) {
		return {
			response,
			sync: props
		}
	})
}

export function tSync<T extends Record<string, TSchema>>(schema: T) {
	const tables = Object.keys(schema) as (keyof T)[]

	const insertSchema = tables.reduce<tInsertSchema<T>>((acc, table) => {
		const tableSchema = schema[table]
		acc[table] = t.Optional(
			t.Union([
				t.Object({ data: tableSchema }),
				t.Array(t.Object({ data: tableSchema }))
			])
		)
		return acc
	}, {} as tInsertSchema<T>)

	const updateSchema = tables.reduce<tUpdateSchema<T>>((acc, table) => {
		const tableSchema = t.Partial(schema[table])
		acc[table] = t.Optional(
			t.Union([
				t.Object({ filter: tableSchema, data: tableSchema }),
				t.Array(t.Object({ filter: tableSchema, data: tableSchema }))
			])
		)
		return acc
	}, {} as tUpdateSchema<T>)

	const deleteSchema = tables.reduce<tDeleteSchema<T>>((acc, table) => {
		const tableSchema = t.Partial(schema[table])
		acc[table] = t.Optional(
			t.Union([
				t.Object({ filter: tableSchema }),
				t.Array(t.Object({ filter: tableSchema }))
			])
		)
		return acc
	}, {} as tDeleteSchema<T>)

	return function responseWithSync<U extends TSchema>(response: U) {
		return t.Object({
			response,
			sync: t.Optional(
				t.Object({
					insert: t.Optional(t.Object(insertSchema)),
					update: t.Optional(t.Object(updateSchema)),
					delete: t.Optional(t.Object(deleteSchema))
				})
			)
		})
	}
}

type GetDataProps<
	T extends Record<string, TSchema>,
	U,
	V extends Treaty.TreatyResponse<{
		200: {
			response: U
			sync?: {
				insert?: InsertSchema<T>
				delete?: DeleteSchema<T>
				update?: UpdateSchema<T>
			}
		}
	}>
> = {
	fetch: () => Promise<V>
	preFetchGetCache: () => Promise<U | undefined>
	postFetchWriteCache: (data: {
		response: U
		sync?: {
			insert?: InsertSchema<T>
			delete?: DeleteSchema<T>
			update?: UpdateSchema<T>
		}
	}) => Promise<void>
}

export async function getData<
	T extends Record<string, TSchema>,
	U,
	V extends Treaty.TreatyResponse<{
		200: {
			response: U
			sync?: {
				insert?: InsertSchema<T>
				update?: UpdateSchema<T>
				delete?: DeleteSchema<T>
			}
		}
	}>
>({
	fetch,
	preFetchGetCache,
	postFetchWriteCache
}: GetDataProps<T, U, V>): Promise<U | V> {
	return Promise.race([
		new Promise<U>((res) => {
			preFetchGetCache().then((cache) => {
				if (cache) {
					res(cache)
				}
			})
		}),
		new Promise<U | V>((res) => {
			fetch().then((response) => {
				if (response.error) {
					res(response)
				} else {
					postFetchWriteCache(response.data).then(() => {
						res(response.data.response)
					})
				}
			})
		})
	])
}

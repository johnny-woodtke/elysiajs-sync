import Elysia, { t, TSchema } from "elysia"

import {
	DeleteSchema,
	InsertSchema,
	tDeleteSchema,
	tInsertSchema,
	tUpdateSchema,
	tUpsertSchema,
	UpdateSchema,
	UpsertSchema
} from "./types"

export default function sync<T extends Record<string, TSchema>>(schema: T) {
	return new Elysia().decorate("sync", function responseWithSync<
		U,
		V extends
			| {
					insert?: InsertSchema<T>
					update?: UpdateSchema<T>
					upsert?: UpsertSchema<T>
					delete?: DeleteSchema<T>
			  }
			| undefined
	>(response: U, props?: V) {
		return {
			response,
			...(props && { sync: props })
		}
	})
}

export function tSync<T extends Record<string, TSchema>>(schema: T) {
	const tables = Object.keys(schema) as (keyof T)[]

	const insertSchema = tables.reduce<tInsertSchema<T>>((acc, table) => {
		const tableSchema = schema[table]
		acc[table] = t.Optional(
			t.Union([
				t.Object({ filter: t.Partial(tableSchema), data: tableSchema }),
				t.Array(t.Object({ filter: t.Partial(tableSchema), data: tableSchema }))
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

	const upsertSchema: tUpsertSchema<T> = {
		...insertSchema
	}

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
					upsert: t.Optional(t.Object(upsertSchema)),
					delete: t.Optional(t.Object(deleteSchema))
				})
			)
		})
	}
}

import { TArray, TObject, TOptional, TPartial, TUnion } from "@sinclair/typebox"
import Elysia, { Static, TSchema, t } from "elysia"

type StaticSchema<T extends Record<string, TSchema>> = {
	[K in keyof T]: Static<T[K]>
}

export default function sync<T extends Record<string, TSchema>>(schema: T) {
	type Schema = StaticSchema<T>

	type InsertSchema = {
		[K in keyof T]?: { data: Schema[K] } | { data: Schema[K] }[]
	}

	type UpdateSchema = {
		[K in keyof T]?:
			| {
					filter: Partial<Schema[K]>
					data: Partial<Schema[K]>
			  }
			| {
					filter: Partial<Schema[K]>
					data: Partial<Schema[K]>
			  }[]
	}

	type DeleteSchema = {
		[K in keyof T]?:
			| { filter: Partial<Schema[K]> }
			| { filter: Partial<Schema[K]> }[]
	}

	return new Elysia().decorate("sync", function responseWithSync<
		U,
		V extends
			| {
					insert?: InsertSchema
					delete?: DeleteSchema
					update?: UpdateSchema
			  }
			| undefined
	>(response: U, props?: V) {
		return {
			response,
			sync: props
		}
	})
}

export function tSync<U extends Record<string, TSchema>>(schema: U) {
	const tables = Object.keys(schema) as (keyof U)[]

	type InsertSchemas = {
		[K in keyof U]: TOptional<
			TUnion<
				[
					TObject<{
						data: U[K]
					}>,
					TArray<
						TObject<{
							data: U[K]
						}>
					>
				]
			>
		>
	}

	const insertSchemas = tables.reduce<InsertSchemas>((acc, table) => {
		const tableSchema = schema[table]
		acc[table] = t.Optional(
			t.Union([
				t.Object({ data: tableSchema }),
				t.Array(t.Object({ data: tableSchema }))
			])
		) as any
		return acc
	}, {} as InsertSchemas)

	type UpdateSchemas = {
		[K in keyof U]: TOptional<
			TUnion<
				[
					TObject<{
						filter: TPartial<U[K]>
						data: TPartial<U[K]>
					}>,
					TArray<
						TObject<{
							filter: TPartial<U[K]>
							data: TPartial<U[K]>
						}>
					>
				]
			>
		>
	}

	const updateSchemas = tables.reduce<UpdateSchemas>((acc, table) => {
		const tableSchema = t.Partial(schema[table])
		acc[table] = t.Optional(
			t.Union([
				t.Object({ filter: tableSchema, data: tableSchema }),
				t.Array(t.Object({ filter: tableSchema, data: tableSchema }))
			])
		)
		return acc
	}, {} as UpdateSchemas)

	type DeleteSchemas = {
		[K in keyof U]: TOptional<
			TUnion<
				[
					TObject<{ filter: TPartial<U[K]> }>,
					TArray<TObject<{ filter: TPartial<U[K]> }>>
				]
			>
		>
	}

	const deleteSchemas = tables.reduce<DeleteSchemas>((acc, table) => {
		const tableSchema = t.Partial(schema[table])
		acc[table] = t.Optional(
			t.Union([
				t.Object({ filter: tableSchema }),
				t.Array(t.Object({ filter: tableSchema }))
			])
		)
		return acc
	}, {} as DeleteSchemas)

	return <T extends TSchema>(response: T) => {
		return t.Object({
			response,
			sync: t.Optional(
				t.Object({
					insert: t.Optional(t.Object(insertSchemas)),
					update: t.Optional(t.Object(updateSchemas)),
					delete: t.Optional(t.Object(deleteSchemas))
				})
			)
		})
	}
}

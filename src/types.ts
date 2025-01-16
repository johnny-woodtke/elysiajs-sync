import { TArray, TObject, TOptional, TPartial, TUnion } from "@sinclair/typebox"
import { Static, TSchema } from "elysia"

export type InsertSchema<T extends Record<string, TSchema>> = {
	[K in keyof T]?: { data: Static<T[K]> } | { data: Static<T[K]> }[]
}

export type UpdateSchema<T extends Record<string, TSchema>> = {
	[K in keyof T]?:
		| { filter: Partial<Static<T[K]>>; data: Partial<Static<T[K]>> }
		| { filter: Partial<Static<T[K]>>; data: Partial<Static<T[K]>> }[]
}

export type DeleteSchema<T extends Record<string, TSchema>> = {
	[K in keyof T]?:
		| { filter: Partial<Static<T[K]>> }
		| { filter: Partial<Static<T[K]>> }[]
}

export type tInsertSchema<T extends Record<string, TSchema>> = {
	[K in keyof T]: TOptional<
		TUnion<
			[
				TObject<{
					data: T[K]
				}>,
				TArray<
					TObject<{
						data: T[K]
					}>
				>
			]
		>
	>
}

export type tUpdateSchema<T extends Record<string, TSchema>> = {
	[K in keyof T]: TOptional<
		TUnion<
			[
				TObject<{ filter: TPartial<T[K]>; data: TPartial<T[K]> }>,
				TArray<TObject<{ filter: TPartial<T[K]>; data: TPartial<T[K]> }>>
			]
		>
	>
}

export type tDeleteSchema<T extends Record<string, TSchema>> = {
	[K in keyof T]: TOptional<
		TUnion<
			[
				TObject<{ filter: TPartial<T[K]> }>,
				TArray<TObject<{ filter: TPartial<T[K]> }>>
			]
		>
	>
}

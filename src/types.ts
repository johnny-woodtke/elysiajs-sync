import { Treaty } from "@elysiajs/eden"
import { TArray, TObject, TOptional, TPartial, TUnion } from "@sinclair/typebox"
import { Static, TSchema } from "elysia"

export type InsertSchema<T extends Record<string, TSchema>> = {
	[K in keyof T]?:
		| { filter: Partial<Static<T[K]>>; data: Static<T[K]> }
		| { filter: Partial<Static<T[K]>>; data: Static<T[K]> }[]
}

export type UpdateSchema<T extends Record<string, TSchema>> = {
	[K in keyof T]?:
		| { filter: Partial<Static<T[K]>>; data: Partial<Static<T[K]>> }
		| { filter: Partial<Static<T[K]>>; data: Partial<Static<T[K]>> }[]
}

export type UpsertSchema<T extends Record<string, TSchema>> = InsertSchema<T>

export type DeleteSchema<T extends Record<string, TSchema>> = {
	[K in keyof T]?:
		| { filter: Partial<Static<T[K]>> }
		| { filter: Partial<Static<T[K]>> }[]
}

export type tInsertSchema<T extends Record<string, TSchema>> = {
	[K in keyof T]: TOptional<
		TUnion<
			[
				TObject<{ filter: TPartial<T[K]>; data: T[K] }>,
				TArray<TObject<{ filter: TPartial<T[K]>; data: T[K] }>>
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

export type tUpsertSchema<T extends Record<string, TSchema>> = tInsertSchema<T>

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

export type SyncTreatyResponse<
	T extends Record<string, TSchema>,
	TResponse
> = Treaty.TreatyResponse<{
	200: {
		response: TResponse
		sync?: {
			insert?: InsertSchema<T>
			update?: UpdateSchema<T>
			upsert?: UpsertSchema<T>
			delete?: DeleteSchema<T>
		}
	}
}>

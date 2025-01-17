import { Treaty } from "@elysiajs/eden"
import { TSchema } from "elysia"

import { DeleteSchema, UpdateSchema } from "./types"
import { InsertSchema } from "./types"

export class Sync<
	T extends Record<string, TSchema>,
	TPullResponse,
	TPullSync extends Treaty.TreatyResponse<{
		200: {
			response: TPullResponse
			sync?: {
				insert?: InsertSchema<T>
				delete?: DeleteSchema<T>
				update?: UpdateSchema<T>
			}
		}
	}>,
	TPushResponse,
	TPushSync extends Treaty.TreatyResponse<{
		200: {
			response: TPushResponse
			sync?: {
				insert?: InsertSchema<T>
				delete?: DeleteSchema<T>
				update?: UpdateSchema<T>
			}
		}
	}>
> {
	private schema: T
	private push: () => Promise<TPushSync>
	private pull: () => Promise<TPullSync>

	constructor({
		schema,
		push,
		pull
	}: {
		schema: T
		push: () => Promise<TPushSync>
		pull: () => Promise<TPullSync>
	}) {
		this.schema = schema
		this.push = push
		this.pull = pull
	}
}

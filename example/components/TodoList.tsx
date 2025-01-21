"use client"

import { config } from "@/lib/client/schema"
import type { Static } from "elysia"

import { TodoItem } from "./TodoItem"

interface TodoListProps {
	todos: Static<typeof config.schema.todo>[]
	onToggleComplete: (
		todo: Pick<Static<typeof config.schema.todo>, "id" | "completed">
	) => Promise<void>
	onDelete: (id: string) => Promise<void>
}

export function TodoList({ todos, onToggleComplete, onDelete }: TodoListProps) {
	if (todos.length === 0) {
		return (
			<div className="text-center text-black/60 dark:text-white/60 py-8">
				No todos yet. Add one above!
			</div>
		)
	}

	return (
		<div className="space-y-4">
			{todos.map((todo) => (
				<TodoItem
					key={todo.id}
					todo={todo}
					onToggleComplete={onToggleComplete}
					onDelete={onDelete}
				/>
			))}
		</div>
	)
}

"use client"

import { schema } from "@/lib/client/schema"
import type { Static } from "elysia"

interface TodoItemProps {
	todo: Static<typeof schema.todo>
	onToggleComplete: (
		todo: Pick<Static<typeof schema.todo>, "id" | "completed">
	) => Promise<void>
	onDelete: (id: string) => Promise<void>
}

export function TodoItem({ todo, onToggleComplete, onDelete }: TodoItemProps) {
	return (
		<div className="p-4 rounded-lg border border-black/[.08] dark:border-white/[.08] bg-black/[.02] dark:bg-white/[.02]">
			<div className="flex items-start justify-between gap-4">
				<div className="flex-1">
					<div className="flex items-center gap-2">
						<input
							type="checkbox"
							checked={todo.completed}
							onChange={(e) =>
								onToggleComplete({
									id: todo.id,
									completed: e.target.checked
								})
							}
							className="rounded border-black/[.08] dark:border-white/[.08]"
						/>
						<h3
							className={`font-semibold ${todo.completed ? "line-through opacity-50" : ""}`}
						>
							{todo.title}
						</h3>
					</div>
					<p
						className={`mt-1 text-sm ${todo.completed ? "line-through opacity-50" : ""}`}
					>
						{todo.description}
					</p>
				</div>
				<div className="flex gap-2">
					<button
						onClick={() => onDelete(todo.id)}
						className="p-2 rounded-md hover:bg-black/[.05] dark:hover:bg-white/[.05] text-red-500"
					>
						Delete
					</button>
				</div>
			</div>
		</div>
	)
}

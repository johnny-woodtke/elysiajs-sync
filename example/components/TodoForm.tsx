"use client"

import { config } from "@/lib/client/schema"
import type { Static } from "elysia"
import { useState } from "react"

interface TodoFormProps {
	onSubmit: (
		todo: Pick<Static<typeof config.schema.todo>, "title" | "description">
	) => Promise<void>
}

export function TodoForm({ onSubmit }: TodoFormProps) {
	const [newTodo, setNewTodo] = useState<
		Pick<Static<typeof config.schema.todo>, "title" | "description">
	>({
		title: "",
		description: ""
	})

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		await onSubmit(newTodo)
		setNewTodo({ title: "", description: "" })
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-4 bg-black/[.02] dark:bg-white/[.02] p-6 rounded-lg border border-black/[.08] dark:border-white/[.08]"
		>
			<input
				type="text"
				placeholder="Title"
				value={newTodo.title}
				onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
				className="w-full p-2 rounded-md border border-black/[.08] dark:border-white/[.08] bg-white dark:bg-black"
				required
			/>
			<textarea
				placeholder="Description"
				value={newTodo.description}
				onChange={(e) =>
					setNewTodo({ ...newTodo, description: e.target.value })
				}
				className="w-full p-2 rounded-md border border-black/[.08] dark:border-white/[.08] bg-white dark:bg-black"
				required
			/>
			<button
				type="submit"
				className="w-full rounded-full border border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] h-10 px-4"
			>
				Add Todo
			</button>
		</form>
	)
}

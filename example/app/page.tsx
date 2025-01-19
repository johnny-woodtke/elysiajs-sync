"use client"

import { TodoForm } from "@/components/TodoForm"
import { TodoList } from "@/components/TodoList"
import { client } from "@/lib/client/eden"
import { keys, schema } from "@/lib/client/schema"
import { useLiveQuery } from "dexie-react-hooks"
import type { Static } from "elysia"
import Image from "next/image"
import { useMemo } from "react"

import { Sync } from "../../src/client"

export default function Home() {
	const sync = useMemo(
		() =>
			new Sync({
				schema,
				keys
			}),
		[]
	)

	const todos = useLiveQuery(() => sync.db.todo.toArray())

	const addTodo = async (
		newTodo: Pick<Static<typeof schema.todo>, "title" | "description">
	) => {
		await sync.fetch(() =>
			client.api.todos.post({ ...newTodo, completed: false })
		)
	}

	const deleteTodo = async (id: string) => {
		await Promise.all([
			sync.db.todo.delete(id),
			sync.fetch(() => client.api.todos({ id }).delete())
		])
	}

	const toggleComplete = async (
		todo: Pick<Static<typeof schema.todo>, "id" | "completed">
	) => {
		await Promise.all([
			sync.db.todo.update(todo.id, { completed: todo.completed }),
			sync.fetch(() =>
				client.api.todos({ id: todo.id }).patch({ completed: todo.completed })
			)
		])
	}

	return (
		<div className="grid grid-rows-[auto_1fr_auto] min-h-screen p-8 pb-20 gap-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
			<header className="flex flex-col items-center gap-4">
				<Image
					className="dark:invert"
					src="/next.svg"
					alt="Next.js logo"
					width={180}
					height={38}
					priority
				/>
				<h1 className="text-2xl font-bold">Todos</h1>
			</header>

			<main className="flex flex-col gap-8 max-w-2xl mx-auto w-full">
				<TodoForm onSubmit={addTodo} />
				<TodoList
					todos={todos ?? []}
					onToggleComplete={toggleComplete}
					onDelete={deleteTodo}
				/>
			</main>

			<footer className="flex gap-6 flex-wrap items-center justify-center">
				<p className="text-sm text-black/60 dark:text-white/60">
					Built with Elysia and Dexie
				</p>
			</footer>
		</div>
	)
}

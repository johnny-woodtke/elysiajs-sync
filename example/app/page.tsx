"use client"

import { TodoForm } from "@/components/TodoForm"
import { TodoList } from "@/components/TodoList"
import { useSync } from "@/hooks/useSync"
import { client } from "@/lib/client/eden"
import { config } from "@/lib/client/schema"
import { useLiveQuery } from "dexie-react-hooks"
import type { Static } from "elysia"
import Image from "next/image"

export default function Home() {
	const { sync, db } = useSync()

	const todos = useLiveQuery(() => db.todo.toArray()) ?? []

	async function addTodo(
		newTodo: Pick<Static<typeof config.schema.todo>, "title" | "description">
	) {
		await sync.fetch(() =>
			client.api.todos.post({ ...newTodo, completed: false })
		)
	}

	async function deleteTodo(id: string) {
		await Promise.all([
			db.todo.delete(id),
			sync.fetch(() => client.api.todos({ id }).delete())
		])
	}

	async function toggleComplete(
		todo: Pick<Static<typeof config.schema.todo>, "id" | "completed">
	) {
		await Promise.all([
			db.todo.update(todo.id, {
				completed: todo.completed,
				updatedAt: new Date()
			}),
			sync
				.fetch(() =>
					client.api.todos({ id: todo.id }).patch({ completed: todo.completed })
				)
				.then(async (res) => {
					// handle 404
					if (res.status !== 404) {
						return
					}

					// get local todo
					const localTodo = await db.todo.get(todo.id)
					if (!localTodo) {
						return
					}

					// push local todo to server
					await sync.fetch(() => client.api.todos.post(localTodo))
				})
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
					todos={todos}
					onToggleComplete={toggleComplete}
					onDelete={deleteTodo}
				/>
			</main>

			<footer className="flex gap-6 flex-wrap items-center justify-center">
				<p className="text-sm text-black/60 dark:text-white/60">
					Built with Dexie and Elysia
				</p>
			</footer>
		</div>
	)
}

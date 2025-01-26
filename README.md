# elysiajs-sync

A lightweight framework for building offline-first Elysia web applications with seamless client-server data synchronization using Dexie.js.

## Features

- 🔄 Automatic data synchronization between client and server
- 📱 Offline-first architecture using IndexedDB (via Dexie.js)
- 🔒 Type-safe schema definitions and operations
- 🚀 Support for all common database operations (CRUD)
- 🔍 Efficient bulk operations support
- 📐 Built-in TypeScript support with full type inference
- 🤝 Framework-agnostic client: integrate with any frontend framework
- 📈 Schema versioning support with migration capabilities

## Installation

```bash
bun add elysiajs-sync
```

## Usage

### 1. Define the Sync Configuration

First, define your sync configuration with schema and indexes:

```typescript
import { t } from "elysia/type-system"
import { getSyncConfig } from "elysiajs-sync/client"

const todo = t.Object({
	id: t.String(),
	title: t.String(),
	description: t.String(),
	completed: t.Boolean(),
	createdAt: t.Date(),
	updatedAt: t.Date()
})

export const config = getSyncConfig({
	name: "todo-sync",
	schema: {
		todo
	},
	keys: {
		todo: ["id", "completed", "createdAt", "updatedAt"]
	},
	latestVerno: 2,
	previousVersions: [
		{
			verno: 1,
			keys: {
				todo: ["id", "completed"]
			}
		}
	]
})
```

### 2. Instrument Server

Use the sync plugin in your Elysia app:

```typescript
import { cors } from "@elysiajs/cors"
import { swagger } from "@elysiajs/swagger"
import { Elysia, t } from "elysia"
import { sync, tSync as _tSync } from "elysiajs-sync"

// Import the config from wherever it's defined
import { config } from "./schema"

// Optional: only needed to support Swagger docs
const tSync = _tSync(config)

const app = new Elysia({ prefix: "/api" })
	.use(cors())
	.use(sync(config))
	.post(
		"/todos",
		({ sync, body }) => {
			const todo = {
				id: crypto.randomUUID(),
				createdAt: new Date(),
				updatedAt: new Date(),
				...body
			}

			// Return with sync instructions
			return sync(todo, {
				todo: {
					put: [todo, undefined]
				}
			})
		},
		{
			body: t.Object({
				title: t.String(),
				description: t.String(),
				completed: t.Boolean()
			}),
			response: {
				200: tSync(config.schema.todo)
			}
		}
	)
	.use(swagger())

export type App = typeof app
```

### 3. Use in React Components

Create a hook to access the sync client:

```typescript
import { Sync } from "elysiajs-sync/client"
import { useMemo } from "react"

import { config } from "./schema"

export function useSync() {
	const sync = useMemo(() => new Sync(config), [])
	const db = sync.getDb()
	return { sync, db }
}
```

Then use it in your components:

```typescript
function TodoList() {
	const { db } = useSync()
	const todos = useLiveQuery(() => db.todo.toArray())

	// Use todos in your component
}
```

## Supported Operations

- Single record operations:

  - `put`: Insert or update a record
  - `add`: Add a new record
  - `update`: Update an existing record
  - `delete`: Delete a record

- Bulk operations:

  - `bulkPut`: Insert or update multiple records
  - `bulkAdd`: Add multiple records
  - `bulkUpdate`: Update multiple records
  - `bulkDelete`: Delete multiple records

## How it Works

elysiajs-sync provides a seamless way to keep your client-side IndexedDB in sync with your server-side data:

1. Define a schema and sync configuration with versioning support
2. Server includes sync instructions in API responses
3. Client automatically applies these sync instructions to the local database
4. All operations are type-safe and validated against your schema
5. The local database can be used offline, with changes syncing when back online

## Example

Check out the example directory for a complete todo list application that demonstrates:

- Schema configuration with versioning
- Server-side sync implementation
- React hooks and components using the sync client
- Offline-first data management

### Run the Example

```bash
bun run dev
```

# elysiajs-sync

A plugin for building offline-first Elysia applications with seamless client-server data synchronization using Dexie.js.

## Features

- 🔄 Automatic data synchronization between client and server
- 📱 Offline-first architecture using IndexedDB (via Dexie.js)
- 🔒 Type-safe schema definitions and operations
- 🚀 Support for all common database operations (CRUD)
- 🔍 Efficient bulk operations support
- 📐 Built-in TypeScript support with full type inference
- 🤝 Framework-agnostic client: integrate with any frontend framework

## Installation

```bash
bun add elysiajs-sync
```

## Usage

### 1. Define the IDB Schema

First, define your IndexedDB schema and specify the indexes:

```typescript
// Import from "elysia/type-system" to make the schema client-side compatible
import { t } from "elysia/type-system"
import { SyncDexieSchema, SyncDexieKeys } from "elysiajs-sync/types"

export const schema = {
	todo: t.Object({
		id: t.String(),
		title: t.String(),
		description: t.String(),
		completed: t.Boolean(),
		createdAt: t.Date(),
		updatedAt: t.Date()
	})
} satisfies SyncDexieSchema

export const keys = {
	todo: ["id", "completed", "createdAt", "updatedAt"]
} satisfies SyncDexieKeys<typeof schema>
```

### 2. Instrument Server

Use the sync plugin in your Elysia app:

```typescript
import { swagger } from "@elysiajs/swagger"
import { Elysia, t } from "elysia"
import { sync, tSync as _tSync } from "elysiajs-sync"

// Import the schema/keys from wherever they're defined
import { schema, keys } from "./schema"

const tSync = _tSync(schema, keys)

const app = new Elysia()
	.use(sync(schema, keys))
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
					add: [todo, undefined]
				}
			})
		},
		{
			body: t.Omit(schema.todo, ["id", "createdAt", "updatedAt"]),
			response: {
				// Optional: only needed to support Swagger docs
				200: tSync(schema.todo)
			}
		}
	)
	.use(swagger())

export type App = typeof app
```

### 3. Fetch with Sync Client

Initialize sync and treaty:

```typescript
import { treaty } from "@elysiajs/eden"
import { Sync } from "elysiajs-sync/client"

import { schema, keys } from "./schema"
// Import the server type from wherever it's defined
import type { App } from "./server"

// Initialize sync on the client-side
// It needs access to the IndexedDB, which is only available in the browser
const sync = new Sync(schema, keys)

const client = treaty<App>("http://localhost:3000")

// Use the sync client to make requests that automatically sync
const treatyResponse = await sync.fetch(() =>
	client.api.todos.post({
		title: "New Todo",
		description: "Description",
		completed: false
	})
)
```

#### 4. Use the Synced Data

The sync client gives you direct, type-safe access to the client-side IndexedDB (via Dexie.js):

```typescript
import { Sync } from "elysiajs-sync/client"

import { schema, keys } from "./schema"

const sync = new Sync(schema, keys)

const todos = sync.db.todo.toArray()
```

## Supported Operations

- Single record operations:

  - `add`: Add a new record
  - `put`: Insert or update a record
  - `update`: Update an existing record
  - `delete`: Delete a record

- Bulk operations:

  - `bulkAdd`: Add multiple records
  - `bulkPut`: Insert or update multiple records
  - `bulkUpdate`: Update multiple records
  - `bulkDelete`: Delete multiple records

## How it Works

elysiajs-sync provides a seamless way to keep your client-side IndexedDB in sync with your server-side data. When making API requests:

1. The server includes sync instructions in the response
2. The client automatically applies these sync instructions to the local database
3. All operations are type-safe and validated against your schema
4. The local database can be used offline, with changes syncing when back online

## Example

The example is a simple todo list app that uses elysiajs-sync to keep the client-side IndexedDB in sync with the server-side data.

### Run the Example

```bash
bun run dev
```

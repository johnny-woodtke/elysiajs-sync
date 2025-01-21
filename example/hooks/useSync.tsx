import { config } from "@/lib/client/schema"
import { useMemo } from "react"

import { Sync } from "../../src/client"

export function useSync() {
	const sync = useMemo(() => new Sync(config), [])
	const db = sync.getDb()
	return { sync, db }
}

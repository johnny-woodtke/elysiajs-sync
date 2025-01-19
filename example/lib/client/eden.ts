import type { App } from "@/lib/server/router"
import { treaty } from "@elysiajs/eden"

export const client = treaty<App>("http://localhost:3000")

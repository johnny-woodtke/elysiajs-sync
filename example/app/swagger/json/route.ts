import { NextResponse } from "next/server"

export function GET() {
	return NextResponse.redirect("http://localhost:3000/api/swagger/json")
}

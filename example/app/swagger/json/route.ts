import { NextRequest, NextResponse } from "next/server"

export function GET(request: NextRequest) {
	return NextResponse.redirect("http://localhost:3000/api/swagger/json")
}

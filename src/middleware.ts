import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This is a simplified middleware that doesn't use Prisma
// Authentication is handled by NextAuth in API routes and pages
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

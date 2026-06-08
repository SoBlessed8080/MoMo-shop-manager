export { default } from "next-auth/middleware"

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/add-transaction/:path*",
    "/transactions/:path*",
    "/end-of-day/:path*",
  ],
}

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // 現在のログイン状態を確認
  const { data: { session } } = await supabase.auth.getSession()

  // 未ログインでトップページにアクセスしようとしたら /login へリダイレクト
  if (!session && req.nextUrl.pathname === '/') {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return res
}

export const config = {
  matcher: ['/'], // トップページのみを対象にする
}
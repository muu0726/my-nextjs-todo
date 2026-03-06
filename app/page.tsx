import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import TodoCheck from '@/components/TodoCheck'

export default async function TodoPage() {
  const cookieStore = await cookies() // Next.js 16ではawaitが必要な場合があります

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: todos } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // --- Server Actions ---
  async function addTodo(formData: FormData) {
    'use server'
    const title = formData.get('title') as string
    if (!title) return
    
    // Action内でもクライアントを再作成
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get(name) { return cookieStore.get(name)?.value } } }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('todos').insert([{ title, user_id: user.id }])
      revalidatePath('/')
    }
  }

  // ※ toggleTodo, deleteTodo, handleLogout も同様に Action 内で supabase を作成して実行してください。

  return (
    <main className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg text-black">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Todo App</h1>
        <form action={async () => { 'use server'; const s = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookies: { get(name) { return null } } }); await s.auth.signOut(); redirect('/login'); }}>
            <button className="text-sm bg-gray-100 p-2 rounded">ログアウト</button>
        </form>
      </div>
      {/* フォームとリストの表示部分は以前と同じでOK */}
    </main>
  )
}
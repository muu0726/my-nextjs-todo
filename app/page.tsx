import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import TodoCheck from '@/components/TodoCheck'
import Link from 'next/link';

export default async function TodoPage() {
 const dynamic = 'force-dynamic';
  const cookieStore = await cookies();
  // Supabaseクライアントの作成
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

  // 1. ログインユーザーの取得
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. 自分のタスク一覧を取得
  const { data: todos } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // --- Server Actions ---

  // タスク追加
  async function addTodo(formData: FormData) {
    'use server'
    const title = formData.get('title') as string
    if (!title) return

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

  // 削除
  async function deleteTodo(id: number) {
    'use server'
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get(name) { return cookieStore.get(name)?.value } } }
    )
    await supabase.from('todos').delete().eq('id', id)
    revalidatePath('/')
  }

  // ログアウト
  async function handleLogout() {
    'use server'
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get(name) { return null } } } // クッキーを空にしてサインアウト
    )
    await supabase.auth.signOut()
    redirect('/login')
  }

  async function toggleTodo(id: number, isCompleted: boolean) {
    'use server'
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get(name) { return cookieStore.get(name)?.value } } }
    )
    await supabase
      .from('todos')
      .update({ is_completed: !isCompleted })
      .eq('id', id)

    revalidatePath('/')
  }



  //プロフィール情報を取得
  const { data: profile } = await supabase
    .from('profiles')
    .select('username,full_name')
    .eq('id', user?.id)
    .single();

  return (
    <main className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg text-black">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Todo App</h1>
          {/* ユーザー名を表示 */}
          <Link href="/profile" className="text-xs text-blue-500 hover:underline">
            プロフィール編集はこちら
          </Link>
        </div>
        <p className="text-sm text-gray-600">こんにちは,{profile?.full_name || 'ユーザー'}さん</p>
        <form action={handleLogout}>
          <button type="submit" className="text-sm bg-gray-100 hover:bg-gray-200 py-1 px-3 rounded">
            ログアウト
          </button>
        </form>
      </div>

      {/* 入力フォーム */}
      <form action={addTodo} className="flex gap-2 mb-6">
        <input
          type="text"
          name="title"
          placeholder="新しいタスクを入力..."
          className="flex-1 border border-gray-300 p-2 rounded text-black outline-none focus:border-blue-500"
          required
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
          追加
        </button>
      </form>

      {/* タスク一覧 */}
      <ul className="space-y-3">
        {todos?.map((todo) => (
          <li key={todo.id} className="flex items-center justify-between p-2 border-b">
            <div className="flex items-center gap-3">
              {/* チェックボックス（クライアントコンポーネント） */}
              <TodoCheck
                id={todo.id}
                isCompleted={todo.is_completed}
                // toggleActionは別途定義が必要ですが、まずは表示を確認
                toggleAction={toggleTodo}
              />
              <span className={todo.is_completed ? 'line-through text-gray-400' : 'text-gray-800'}>
                {todo.title}
              </span>
            </div>

            {/* 削除ボタン */}
            <form action={deleteTodo.bind(null, todo.id)}>
              <button type="submit" className="text-red-500 hover:text-red-700 p-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </form>
          </li>
        ))}
        {todos?.length === 0 && (
          <p className="text-center text-gray-500 py-4">タスクがありません</p>
        )}
      </ul>
    </main>
  )
}
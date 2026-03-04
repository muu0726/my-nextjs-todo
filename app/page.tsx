import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import TodoCheck from '@/components/TodoCheck';

// export const dynamic = 'force-dynamic' // 常に最新のデータを取得するように強制する
export default async function TodoPage() {
  //1.データベースからタスク一覧を取得
  const { data: todos } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false });

  //2.タスクを追加する処理(Server Action)
  async function addTodo(formData: FormData) {
    'use server';
    const title = formData.get('title') as string;
    if (!title) return;
    await supabase.from('todos').insert([{ title }]);
    revalidatePath('/');//画面を更新して最新のリストを表示
  }

  //3.完了状態を切り替える処理
  async function toggleTodo(id: number, isCompleted: boolean) {
    'use server';
    await supabase
      .from('todos')
      .update({ is_completed: !isCompleted })
      .eq('id', id);
    revalidatePath('/');
  }

  //4.タスクを削除する処理
  async function deleteTodo(id: number) {
    'use server';
    await supabase
      .from('todos')
      .delete()
      .eq('id', id);
    revalidatePath('/');//画面を更新
  }

  return (
    <main className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">My Todo App</h1>

      {/* 入力フォーム */}
      <form action={addTodo} className="flex gap-2 mb-6">
        <input
          type="text"
          name="title"
          placeholder="新しいタスクを入力..."
          className="flex-1 border border-gray-300 p-2 rounded text-black"
          required
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">追加</button>
      </form>

      {/* タスク一覧 */}
      <ul className="space-y-3">
        {todos?.map((todo) => (
          <li key={todo.id} className="flex items-center gap-3 p-2 border-b">
            {/* クライアントコンポーネントを使用 */}
            <div className="flex items-center gap-3">

              <TodoCheck
                id={todo.id}
                isCompleted={todo.is_completed}
                toggleAction={toggleTodo}
              />
              <span className={todo.is_completed ? 'line-through text-gray-400' : 'text-gray-800'}>
                {todo.title}
              </span>
            </div>

            {/* 削除ボタンの追加 */}
            <form action={deleteTodo.bind(null, todo.id)}>
              <button
                type="submit"
                className="text-red-500 hover:text-red-700 p-1 transition"
                aria-label="削除"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />                
                </svg>
              </button>
            </form>
          </li>
        ))}
      </ul>

    </main>
  )
}

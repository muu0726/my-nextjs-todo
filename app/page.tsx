import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import TodoCheck from '@/components/TodoCheck';

export default async function TodoPage() {
  // 1. ログイン情報の取得と未ログイン時の保護
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // 2. 自分のデータのみ取得
  const { data: todos } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // 3. 各種アクション
  async function addTodo(formData: FormData) {
    'use server';
    const title = formData.get('title') as string;
    if (!title) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('todos').insert([{ title, user_id: user.id }]);
    revalidatePath('/');
  }

  async function toggleTodo(id: number, isCompleted: boolean) {
    'use server';
    await supabase.from('todos').update({ is_completed: !isCompleted }).eq('id', id);
    revalidatePath('/');
  }

  async function deleteTodo(id: number) {
    'use server';
    await supabase.from('todos').delete().eq('id', id);
    revalidatePath('/');
  }

  async function handleLogout() {
    'use server';
    await supabase.auth.signOut();
    redirect('/login');
  }

  return (
    <main className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Todo App</h1>
        <form action={handleLogout}>
          <button type="submit" className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 py-1 px-3 rounded">ログアウト</button>
        </form>
      </div>

      <form action={addTodo} className="flex gap-2 mb-6">
        <input type="text" name="title" placeholder="新しいタスク..." className="flex-1 border p-2 rounded text-black" required />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">追加</button>
      </form>

      <ul className="space-y-3">
        {todos?.map((todo) => (
          <li key={todo.id} className="flex items-center justify-between p-2 border-b">
            <div className="flex items-center gap-3">
              <TodoCheck id={todo.id} isCompleted={todo.is_completed} toggleAction={toggleTodo} />
              <span className={todo.is_completed ? 'line-through text-gray-400' : 'text-gray-800'}>{todo.title}</span>
            </div>
            <form action={deleteTodo.bind(null, todo.id)}>
              <button type="submit" className="text-red-500 hover:text-red-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}
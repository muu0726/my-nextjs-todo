import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import TodoCheck from '@/components/TodoCheck';

export default async function TodoPage() {
  // 1. ログインユーザーの情報を取得
  const { data: { user } } = await supabase.auth.getUser();

  // もしログインしていなければ、ログイン画面へリダイレクトさせる
  if (!user) {
    redirect('/login');
  }

  // 2. データベースから「自分のタスクだけ」を取得
  // (RLSを設定しているので自動的に絞られますが、明示的に指定するとより安全です)
  const { data: todos } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', user.id) // 自分のIDに一致するものだけ
    .order('created_at', { ascending: false });

  // 3. タスクを追加する処理(Server Action)
  async function addTodo(formData: FormData) {
    'use server';
    const title = formData.get('title') as string;
    if (!title) return;

    // 再度ユーザー情報を取得して保存時に user_id を含める
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('todos').insert([
      { 
        title, 
        user_id: user.id // ★ログインユーザーのIDを紐付け
      }
    ]);
    
    revalidatePath('/');
  }

  // 4. 完了状態を切り替える処理
  async function toggleTodo(id: number, isCompleted: boolean) {
    'use server';
    await supabase
      .from('todos')
      .update({ is_completed: !isCompleted })
      .eq('id', id);
    revalidatePath('/');
  }

  // 5. タスクを削除する処理
  async function deleteTodo(id: number) {
    'use server';
    await supabase
      .from('todos')
      .delete()
      .eq('id', id);
    revalidatePath('/');
  }

  //ログアウト処理(Server Action)
  async function handleLogout() {
    'use server';
    const { error } = await supabase.auth.signOut();
    if(!error) {
      redirect('/login');
    }
  }

  return (
    <main className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Todo App</h1>
        {/* ログアウトボタン*/}
        <form action={handleLogout}>
          <button
            type="submit"
            className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-3 rounded transition"
          >ログアウト
          </button>  
        </form>
      </div>

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
          <li key={todo.id} className="flex items-center justify-between p-2 border-b">
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
        {todos?.length === 0 && (
          <p className="text-center text-gray-500">タスクがありません</p>
        )}
      </ul>
    </main>
  );
}
'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    if (!email || !password) return alert('入力してください');
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert('ユーザー登録に成功しました！');
  };

  const handleLogin = async () => {
    if (!email || !password) return alert('入力してください');
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      alert("ログインエラー: " + error.message);
    } else if (data.session) {
      // セッションを確実にブラウザへセットし、強制的にトップページを読み込む
      await supabase.auth.setSession(data.session);
      window.location.assign('/');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold">TODOアプリにログイン</h1>
      <div className="flex flex-col gap-4 w-80">
        <input 
          type="email" placeholder="メールアドレス" 
          className="border-2 border-gray-500 p-3 rounded bg-white text-black outline-none"
          onChange={(e) => setEmail(e.target.value)} 
          value={email}
        />
        <input 
          type="password" placeholder="パスワード" 
          className="border-2 border-gray-500 p-3 rounded bg-white text-black outline-none"
          onChange={(e) => setPassword(e.target.value)} 
          value={password}
        />
      </div>
      <div className="flex gap-4">
        <button onClick={handleLogin} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-bold transition">ログイン</button>
        <button onClick={handleSignUp} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-bold transition">新規登録</button>
      </div>
    </div>
  );
}
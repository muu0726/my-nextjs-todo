'use client';
import {useState} from 'react';
import {supabase} from '@/lib/supabase';
import {useRouter} from 'next/navigation';

export default function LoginPage(){
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
    const router = useRouter();

    const handleSignUp = async () => {
        const {error} = await supabase.auth.signUp({email,password});
        if(error) alert(error.message);
        else alert('ユーザー登録に成功しました!');
    };
    
    const handleLogin = async () => {
        const { error }  = await supabase.auth.signInWithPassword({email,password});
        if(error) alert(error.message);
        else {
            router.push('/');//ログイン成功でメイン画面へ
            router.refresh();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <h1 className="text-2xl font-bold">TODOアプリにログイン</h1>
            <input
                type="email" placeholder="メールアドレス"
                className="border p-2 rounded w-64 text-black"
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password" placeholder="パスワード"
                className="border p-2 rounded w-64 text-black"
                onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex gap-2">
                <button onClick={handleLogin} className="bg-blue-500 text-white px-4 py-2 rounded">ログイン</button>
                <button onClick={handleSignUp} className="bg-green-500 text-white px-4 py-2 rounded">新規登録</button>
            </div> 
        </div>
    )
}
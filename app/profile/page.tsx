'use client'
import {useState,useEffect} from 'react';
import {supabase} from '@/lib/supabase';
import {useRouter} from 'next/navigation';

export default function ProfilePage() {
    const [loading,setLoading] = useState(true);
    const [fullName,setFullName] = useState('');
    const [username,setUsername] = useState('');
    const router = useRouter();

    useEffect(() => {
        getProfile();
    },[]);

    async function getProfile() {
        try {
            const {data:{user}} = await supabase.auth.getUser();
            if(!user) {
                router.push('/login');
                return;
            }
            const {data,error} = await supabase
                .from('profiles')
                .select('full_name,username')
                .eq('id',user.id)
                .single();
            
            if(data) {
                setFullName(data.full_name || '');
                setUsername(data.username || '');
            }
        }catch (error) {
            console.error('エラー:',error);
        } finally {
            setLoading(false);
        }
    }

    async function updateProfile() {
        setLoading(true);
        const {data:{user}} = await supabase.auth.getUser();

        const updates = {
            id:user?.id,
            full_name:fullName,
            username:username,
            updated_at:new Date().toISOString(),
        };

        const {error} = await supabase.from('profiles').upsert(updates);

        if(error) {
            alert(error.message);
        } else {
            alert('プロフィールを更新しました');
            router.refresh();
            setTimeout(() => {
                router.push('/');
            },100);
        }
        setLoading(false);
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
            <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-xl">
                <h1 className="text-2xl font-bold mb-6 text-center">プロフィール編集</h1>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">氏名</label>
                        <input 
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-3 rounded bg-white text-black outline-none focus:ring-blue-500"
                            placeholder="yamada_01"
                        />    
                    </div>

                    <button
                        onClick={updateProfile}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 transition duration-200"
                    >
                        {loading ? '更新中...' : '保存する'}
                    </button>
                    <button
                        onClick={() => router.push('/')}
                        className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded transition"
                    >
                        戻る    
                    </button>  
                </div>
            </div>
        </div>
    )
}
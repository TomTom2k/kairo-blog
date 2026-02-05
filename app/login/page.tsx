'use client';

import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
	const supabase = supabaseBrowser();
	const router = useRouter();

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');

	const login = async () => {
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			setError(error.message);
		} else {
			router.push('/admin');
		}
	};

	return (
		<div className='min-h-screen flex items-center justify-center'>
			<div className='w-80 space-y-4'>
				<h1 className='text-2xl font-bold'>Admin Login</h1>

				<input
					placeholder='Email'
					className='border p-2 w-full'
					onChange={(e) => setEmail(e.target.value)}
				/>
				<input
					type='password'
					placeholder='Password'
					className='border p-2 w-full'
					onChange={(e) => setPassword(e.target.value)}
				/>

				{error && <p className='text-red-500'>{error}</p>}

				<button
					onClick={login}
					className='bg-black text-white w-full p-2'>
					Đăng nhập
				</button>
			</div>
		</div>
	);
}

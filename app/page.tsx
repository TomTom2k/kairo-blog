import { supabase } from '@/lib/supabase';

export default async function Home() {
	const { data: posts } = await supabase
		.from('posts')
		.select('*')
		.eq('published', true)
		.order('created_at', { ascending: false });

	console.log(posts);

	return (
		<main className='max-w-2xl mx-auto p-6'>
			<h1 className='text-3xl font-bold mb-6'>Blog của tôi</h1>

			{posts?.map((post) => (
				<a
					key={post.id}
					href={`/blog/${post.slug}`}
					className='block mb-4'>
					<h2 className='text-xl font-semibold'>{post.title}</h2>
					<p className='text-sm text-gray-500'>
						{new Date(post.created_at).toLocaleDateString()}
					</p>
				</a>
			))}
		</main>
	);
}

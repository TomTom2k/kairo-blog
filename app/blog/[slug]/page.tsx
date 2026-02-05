import { supabase } from '@/lib/supabase';

export default async function BlogDetail({ params }: any) {
	const { data: post } = await supabase
		.from('posts')
		.select('*')
		.eq('slug', params.slug)
		.single();

	if (!post) return <div>Không tìm thấy bài viết</div>;

	return (
		<article className='max-w-2xl mx-auto p-6'>
			<h1 className='text-3xl font-bold mb-4'>{post.title}</h1>
			<div className='prose'>{post.content}</div>
		</article>
	);
}

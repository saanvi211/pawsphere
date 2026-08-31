import React, { useEffect, useState } from 'react';
import { Flag, Heart, ImagePlus, MessageCircle, Send, Trash2, Users } from 'lucide-react';
import { Animal, UserProfile } from '../../types/animal';
import { CommunityPost } from '../../types/community';
import { getCommunityPosts, saveCommunityPosts } from '../../db/storage';

interface CommunityViewProps {
  user: UserProfile;
  animal: Animal | null;
}

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const CommunityView: React.FC<CommunityViewProps> = ({ user, animal }) => {
  const [posts, setPosts] = useState<CommunityPost[]>(() => getCommunityPosts());
  const [caption, setCaption] = useState('');
  const [postImage, setPostImage] = useState('');
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});

  useEffect(() => saveCommunityPosts(posts), [posts]);

  const addPost = () => {
    if (!caption.trim() && !postImage) return;
    const post: CommunityPost = {
      id: createId(), authorId: user.id, authorName: user.name, petName: animal?.name || undefined, petPhotoUrl: animal?.photoUrl?.trim() || undefined, imageUrl: postImage || undefined, caption: caption.trim(), likedBy: [], comments: [], reported: false, createdAt: new Date().toISOString()
    };
    setPosts(current => [post, ...current]);
    setCaption('');
    setPostImage('');
  };

  const readImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPostImage(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const toggleLike = (id: string) => setPosts(current => current.map(post => post.id === id ? { ...post, likedBy: post.likedBy.includes(user.id) ? post.likedBy.filter(idValue => idValue !== user.id) : [...post.likedBy, user.id] } : post));
  const deletePost = (id: string) => setPosts(current => current.filter(post => post.id !== id || post.authorId !== user.id));
  const reportPost = (id: string) => setPosts(current => current.map(post => post.id === id ? { ...post, reported: true } : post));
  const addComment = (postId: string) => {
    const text = commentDrafts[postId]?.trim();
    if (!text) return;
    setPosts(current => current.map(post => post.id === postId ? { ...post, comments: [...post.comments, { id: createId(), authorName: user.name, text, createdAt: new Date().toISOString() }] } : post));
    setCommentDrafts(current => ({ ...current, [postId]: '' }));
  };

  return (
    <div className="py-6 max-w-5xl mx-auto px-3 sm:px-6 space-y-5 text-xs text-slate-100">
      <section className="glass-panel-dark rounded-3xl p-5 sm:p-6 border border-pink-500/30 shadow-xl"><div className="flex items-center gap-3"><Users className="w-6 h-6 text-pink-300" /><div><p className="text-[10px] uppercase tracking-[0.18em] text-pink-300 font-extrabold">PawSphere Community</p><h1 className="text-2xl font-extrabold text-white mt-1">Share the everyday wins</h1><p className="text-[11px] text-slate-400 mt-1">Posting as {user.name}{animal ? ` with ${animal.name}` : ''}.</p></div></div><div className="mt-5 space-y-3"><textarea value={caption} onChange={event => setCaption(event.target.value)} placeholder="Share a moment with the community" className="nutrition-input w-full min-h-20 resize-y" />{postImage && <img src={postImage} alt="Post preview" className="max-h-48 rounded-xl object-cover border border-pink-400/30" />}<div className="flex flex-wrap gap-2"><label className="nutrition-action bg-pink-500/10 border-pink-400/30 text-pink-200 cursor-pointer"><ImagePlus className="w-3.5 h-3.5" /> Add photo<input type="file" accept="image/*" onChange={readImage} className="hidden" /></label><button onClick={addPost} className="nutrition-action bg-pink-500/20 border-pink-400/40 text-pink-200"><Send className="w-3.5 h-3.5" /> Publish post</button></div></div></section>
      <div className="space-y-4">{posts.length === 0 && <div className="glass-panel-dark rounded-2xl p-8 text-center text-slate-400">No community posts yet. Share the first update.</div>}{posts.map(post => { const liked = post.likedBy.includes(user.id); return <article key={post.id} className="glass-panel-dark rounded-2xl border border-cyan-500/25 p-4 space-y-3"><div className="flex justify-between gap-3"><div><p className="font-extrabold text-white">{post.authorName}</p><p className="text-[10px] text-cyan-300">{post.petName ? `With ${post.petName}` : 'Community update'} · {new Date(post.createdAt).toLocaleString()}</p></div><div className="flex gap-2">{post.authorId === user.id && <button onClick={() => deletePost(post.id)} className="text-slate-500 hover:text-red-300" title="Delete your post"><Trash2 className="w-4 h-4" /></button>}<button onClick={() => reportPost(post.id)} className={post.reported ? 'text-amber-300' : 'text-slate-500 hover:text-amber-300'} title="Report post"><Flag className="w-4 h-4" /></button></div></div>{post.imageUrl && <img src={post.imageUrl} alt="Community post" className="w-full max-h-80 object-cover rounded-xl border border-slate-800" />}{post.caption && <p className="text-sm text-slate-200 whitespace-pre-wrap">{post.caption}</p>}<div className="flex items-center gap-4 border-t border-slate-800 pt-3"><button onClick={() => toggleLike(post.id)} className={`flex items-center gap-1.5 ${liked ? 'text-pink-300' : 'text-slate-400 hover:text-pink-300'}`}><Heart className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} />{post.likedBy.length}</button><span className="flex items-center gap-1.5 text-slate-400"><MessageCircle className="w-4 h-4" />{post.comments.length}</span></div><div className="flex gap-2"><input value={commentDrafts[post.id] || ''} onChange={event => setCommentDrafts(current => ({ ...current, [post.id]: event.target.value }))} onKeyDown={event => event.key === 'Enter' && addComment(post.id)} placeholder="Add a comment" className="nutrition-input flex-1" /><button onClick={() => addComment(post.id)} className="nutrition-action bg-cyan-500/10 border-cyan-400/30 text-cyan-200" title="Add comment"><Send className="w-3.5 h-3.5" /></button></div>{post.comments.map(comment => <p key={comment.id} className="text-[10px] text-slate-400"><span className="font-extrabold text-slate-300">{comment.authorName}:</span> {comment.text}</p>)}</article>; })}</div>
    </div>
  );
};

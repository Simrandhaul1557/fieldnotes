import { useActionMutation, useActionQuery } from "@agent-native/core/client/hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { IconArrowLeft, IconBook2, IconMessageCircle } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

function SafeMarkdown({ source }: { source: string }) {
  return <div className="space-y-5 font-editorial text-lg leading-[1.85] text-foreground/85 md:text-xl">{source.split("\n").map((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={index} className="h-1" />;
    const heading = trimmed.match(/^(#{1,3})\s+(.*)$/);
    if (heading) { const Tag = (heading[1] ?? "").length === 1 ? "h2" : "h3"; return <Tag key={index} className="mt-8 font-editorial text-3xl font-medium text-foreground">{heading[2] ?? ""}</Tag>; }
    if (trimmed.startsWith("> ")) return <blockquote key={index} className="border-l-2 border-primary/40 pl-5 italic text-muted-foreground">{trimmed.slice(2)}</blockquote>;
    if (/^[-*]\s+/.test(trimmed)) return <p key={index} className="pl-5 before:mr-3 before:text-primary before:content-['•']">{trimmed.slice(2)}</p>;
    return <p key={index}>{trimmed.split(/(\*\*[^*]+\*\*)/g).map((part, i) => part.startsWith("**") && part.endsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : part)}</p>;
  })}</div>;
}

export default function PublicPostRoute() {
  const { slug = "" } = useParams();
  const { data: post, isLoading } = useActionQuery("get-public-post", { slug });
  const { data: comments = [] } = useActionQuery("list-comments", { postId: post?.id ?? "00000000-0000-4000-8000-000000000000" });
  const addComment = useActionMutation("create-comment");
  const incrementView = useActionMutation("increment-view-count");
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");
  
  useEffect(() => {
    if (post?.slug) {
      incrementView.mutate({ slug: post.slug });
    }
  }, [post?.slug]);

  if (isLoading) return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Loading story…</div>;
  if (!post) return <div className="grid min-h-screen place-items-center p-6 text-center"><div><p className="font-editorial text-4xl font-medium">Story not found</p><Link to="/" className="mt-4 inline-block text-sm text-primary">Back to Fieldnotes</Link></div></div>;
  const words = post.markdown.trim().split(/\s+/).filter(Boolean).length;
  const viewCount = parseInt(post.viewCount || "0", 10);
  return <main className="min-h-screen bg-background"><header className="border-b border-border"><div className="mx-auto flex h-[68px] max-w-5xl items-center justify-between px-5"><Link to="/" className="flex items-center gap-2.5"><span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground"><IconBook2 size={17}/></span><span className="font-editorial text-xl font-semibold">Fieldnotes<span className="text-primary">.</span></span></Link><Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"><IconArrowLeft size={16}/> Explore stories</Link></div></header><article className="mx-auto max-w-3xl px-5 pb-10 pt-12 md:pt-20"><div className="flex flex-wrap gap-2">{post.tags.split(",").filter(Boolean).map((tag: string) => <Badge key={tag} variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">{tag.trim()}</Badge>)}</div><h1 className="mt-5 font-editorial text-5xl font-medium leading-[1.02] tracking-tight md:text-7xl">{post.title}</h1><p className="mt-5 text-lg leading-7 text-muted-foreground">{post.excerpt}</p><div className="my-8 flex items-center justify-between border-y border-border py-4 text-sm text-muted-foreground"><span>By a Fieldnotes contributor</span><span>{Math.max(1, Math.ceil(words / 220))} min read · {viewCount.toLocaleString()} views · {new Date(post.publishedAt ?? post.updatedAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</span></div><SafeMarkdown source={post.markdown}/><section className="mt-14 border-t border-border pt-9"><div className="mb-6 flex items-center gap-2"><IconMessageCircle size={19} className="text-primary"/><h2 className="font-sans text-2xl font-semibold">Join the conversation</h2></div><div className="space-y-4">{(comments as any[]).map(comment => <div key={comment.id} className="rounded-xl bg-secondary/60 p-4"><div className="text-sm font-semibold">{comment.authorName}</div><p className="mt-1 text-sm leading-6 text-foreground/80">{comment.body}</p></div>)}{comments.length === 0 && <p className="text-sm text-muted-foreground">No comments yet. Be the first to share your thoughts.</p>}</div><form className="mt-6 space-y-4" onSubmit={async e => { e.preventDefault(); setMessage(""); try { await addComment.mutate({ postId: post.id, authorName: name, body }); setName(""); setBody(""); setMessage("Comment submitted for moderation."); } catch (err) { setMessage(err instanceof Error ? err.message : "Could not submit comment."); } }}><Input value={name} onChange={e => setName(e.target.value)} maxLength={60} placeholder="Your name" className="rounded-xl bg-background" /><Textarea value={body} onChange={e => setBody(e.target.value)} maxLength={2000} placeholder="Share your thoughts..." className="min-h-[120px] resize-y rounded-xl bg-background" /><Button type="submit" className="rounded-xl">Submit comment</Button>{message && <p className="text-sm text-muted-foreground">{message}</p>}</form></section></article></main>;
}

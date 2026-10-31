import { signOut } from "@agent-native/core/client";
import { useActionMutation, useActionQuery } from "@agent-native/core/client/hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { IconArrowUpRight, IconBook2, IconCheck, IconChevronRight, IconClock, IconEye, IconLayoutDashboard, IconLogout2, IconMessageCircle, IconPencil, IconPlus, IconSearch, IconUsers, IconX } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";

function SafeMarkdown({ source }: { source: string }) {
  return <div className="space-y-3 text-[15px] leading-7 text-foreground/85">{source.split("\n").map((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={index} className="h-1" />;
    const heading = trimmed.match(/^(#{1,3})\s+(.*)$/);
    if (heading) {
      const level = (heading[1] ?? "").length;
      const Tag = level === 1 ? "h2" : level === 2 ? "h3" : "h4";
      return <Tag key={index} className="mt-5 font-editorial text-2xl font-semibold tracking-tight text-foreground">{heading[2] ?? ""}</Tag>;
    }
    if (trimmed.startsWith("> ")) return <blockquote key={index} className="border-l-2 border-primary/40 pl-4 italic text-muted-foreground">{trimmed.slice(2)}</blockquote>;
    if (/^[-*]\s+/.test(trimmed)) return <div key={index} className="flex gap-2"><span className="text-primary">•</span><span>{trimmed.slice(2)}</span></div>;
    return <p key={index}>{trimmed.split(/(\*\*[^*]+\*\*)/g).map((part, i) => part.startsWith("**") && part.endsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : part)}</p>;
  })}</div>;
}

const statusText: Record<string, string> = { draft: "Draft", in_review: "In review", scheduled: "Scheduled", published: "Published" };
const statusClasses: Record<string, string> = {
  draft: "border border-border bg-secondary text-secondary-foreground",
  in_review: "border border-border bg-accent text-accent-foreground",
  scheduled: "border border-border bg-card text-foreground",
  published: "border-transparent bg-primary text-primary-foreground",
};

export default function HomeRoute() {
  const { data: profile } = useActionQuery("get-blog-profile", {});
  const { data: posts = [], isLoading } = useActionQuery("list-posts", {});
  const [tab, setTab] = useState("explore");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(false);
  const [active, setActive] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [tags, setTags] = useState("");
  const [schedule, setSchedule] = useState("");
  const [error, setError] = useState("");
  const canEdit = profile?.role === "editor" || profile?.role === "admin";
  useEffect(() => { if (profile) setTab("workspace"); }, [profile]);
  const createPost = useActionMutation("create-post");
  const updatePost = useActionMutation("update-post");
  const submitPost = useActionMutation("submit-post");
  const reviewPost = useActionMutation("review-post");
  const { data: publicPosts = [] } = useActionQuery("list-public-posts", { query: search });

  const visiblePosts = useMemo(() => posts.filter((post: any) => {
    if (tab === "review") return post.status === "in_review";
    if (tab === "scheduled") return post.status === "scheduled";
    if (tab === "published") return post.status === "published";
    return post.status === "draft" || post.status === "in_review";
  }), [posts, tab]);
  const latestPublished = posts.find((post: any) => post.status === "published");

  function startNew() {
    setActive(null); setTitle(""); setMarkdown(""); setTags(""); setError(""); setEditing(true);
  }
  function startEdit(post: any) {
    if (post.status !== "draft") return;
    setActive(post); setTitle(post.title); setMarkdown(post.markdown); setTags(post.tags); setError(""); setEditing(true);
  }
  async function saveDraft() {
    setError("");
    try {
      if (active) await updatePost.mutate({ id: active.id, title, markdown, tags });
      else await createPost.mutate({ title, markdown, tags });
      setEditing(false);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not save draft."); }
  }
  async function submitDraft(post: any) {
    setError("");
    try { await submitPost.mutate({ id: post.id }); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not submit post."); }
  }
  async function publish(post: any) {
    setError("");
    try {
      const scheduledAt = schedule ? new Date(schedule).toISOString() : undefined;
      await reviewPost.mutate({ id: post.id, ...(scheduledAt ? { scheduledAt } : {}) });
      setSchedule("");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not publish post."); }
  }

  return <div className="min-h-full bg-background">
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/95 shadow-[0_1px_0_hsl(var(--border)/.25)] backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-5 md:px-10">
        <Link to="/" className="flex items-center gap-3" onClick={() => setTab("workspace")}>
          <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm"><IconBook2 size={20} stroke={1.8} /></span>
          <span><span className="block font-editorial text-[23px] font-semibold tracking-tight">Fieldnotes<span className="text-primary">.</span></span><span className="-mt-0.5 block text-[9px] font-semibold uppercase tracking-[.2em] text-muted-foreground">Editorial studio</span></span>
        </Link>
        <div className="flex items-center gap-3">
          {profile ? <><span className="hidden rounded-full bg-primary/8 px-3 py-1.5 text-xs font-semibold capitalize text-primary sm:inline-flex">{profile.role}</span><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="Open profile menu" className="size-10 rounded-full border border-border bg-card p-0"><span className="grid size-full place-items-center rounded-full bg-secondary font-sans text-sm font-semibold text-foreground">{profile.email?.slice(0, 1).toUpperCase()}</span></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-52 rounded-xl"><DropdownMenuLabel className="font-medium">Fieldnotes account</DropdownMenuLabel><DropdownMenuLabel className="-mt-2 text-xs font-normal capitalize text-muted-foreground">{profile.role}</DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuItem onSelect={() => void signOut()} className="cursor-pointer gap-2 text-destructive focus:text-destructive"><IconLogout2 size={16} /> Sign out</DropdownMenuItem></DropdownMenuContent></DropdownMenu><Button onClick={startNew} className="gap-2 rounded-xl shadow-sm"><IconPlus size={17} /> <span className="hidden sm:inline">New story</span></Button></> : <Button asChild className="rounded-xl"><a href="/sign-in">Sign in</a></Button>}
        </div>
      </div>
    </header>
    <div className="mx-auto grid max-w-[1500px] md:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="border-b border-sidebar-border bg-sidebar px-4 py-3 text-sidebar-foreground md:sticky md:top-[68px] md:min-h-[calc(100vh-68px)] md:self-start md:border-b-0 md:px-5 md:py-8">
        <div className="mb-3 hidden px-3 text-[10px] font-semibold uppercase tracking-[.18em] text-primary-foreground/55 md:block">Your workspace</div>
        <nav className="flex gap-1 overflow-x-auto pb-1 md:flex-col md:pb-0">
          {[["workspace", "Overview", IconLayoutDashboard], ["review", "Review queue", IconPencil], ["scheduled", "Scheduled", IconClock], ["published", "Published", IconBook2], ["explore", "Read site", IconEye], ["comments", "Comments", IconMessageCircle], ...(profile?.role === "admin" ? [["team", "Team", IconUsers] as const] : [])].map(([key, label, Icon]: any) => <button key={key} onClick={() => { setTab(key); setEditing(false); }} className={`flex h-10 shrink-0 items-center justify-start gap-3 rounded-xl px-3 text-left text-sm transition-colors ${tab === key ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground shadow-sm" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground"}`}><Icon size={17} stroke={1.8} />{label}{key === "review" && posts.filter((post: any) => post.status === "in_review").length > 0 && <span className="ml-auto rounded-full bg-primary-foreground px-1.5 py-0.5 text-[10px] text-primary">{posts.filter((post: any) => post.status === "in_review").length}</span>}</button>)}
        </nav>
        <div className="mt-12 hidden rounded-2xl border border-sidebar-border bg-sidebar-accent/70 p-4 md:block"><div className="mb-2 flex items-center gap-2 text-xs font-semibold text-sidebar-accent-foreground"><IconBook2 size={15} /> A good story travels.</div><p className="text-xs leading-5 text-sidebar-foreground/70">Write with care, send it through review, and share it with the world.</p></div>
      </aside>

      <main className="min-w-0 px-5 py-7 md:px-10 md:py-11">
        {editing ? <section className="mx-auto max-w-6xl">
          <Button variant="ghost" size="sm" onClick={() => setEditing(false)} className="mb-6 -ml-2 gap-2 text-muted-foreground"><IconChevronRight size={15} className="rotate-180" /> Back to workspace</Button>
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><div className="mb-2 text-xs font-semibold uppercase tracking-[.16em] text-primary">Story editor</div><h1 className="font-editorial text-4xl font-medium tracking-tight md:text-5xl">{active ? "Edit your draft" : "Start a new story"}</h1></div><Button onClick={saveDraft} className="rounded-xl px-5">Save draft</Button></div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="space-y-4 rounded-2xl border border-border/80 bg-card p-5 shadow-sm md:p-7">
              <Input value={title} onChange={e => setTitle(e.target.value)} maxLength={120} placeholder="A thoughtful title..." aria-label="Story title" className="h-auto rounded-none border-0 border-b border-border bg-transparent px-0 pb-4 font-editorial text-2xl font-medium shadow-none outline-none placeholder:text-muted-foreground/55 focus-visible:ring-0 focus-visible:ring-offset-0 md:text-3xl" />
              <Input value={tags} onChange={e => setTags(e.target.value)} maxLength={250} placeholder="Tags, separated by commas" aria-label="Story tags" className="rounded-xl bg-background/70" />
              <Textarea value={markdown} onChange={e => setMarkdown(e.target.value)} maxLength={30000} placeholder={"Write your story in Markdown...\n\n## A fresh perspective\n\nStart with an idea worth sharing."} aria-label="Story in Markdown" className="min-h-[400px] resize-y rounded-xl bg-background/70 p-4 font-mono text-sm leading-6" />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </Card>
            <Card className="min-h-[460px] rounded-2xl border border-border/80 bg-card p-5 shadow-sm md:p-7"><div className="mb-6 flex items-center justify-between border-b border-border pb-4"><span className="text-xs font-semibold uppercase tracking-[.14em] text-muted-foreground">Live preview</span><Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px]">Markdown</Badge></div><h2 className="mb-5 font-editorial text-4xl font-medium leading-tight tracking-tight">{title || "Your story title"}</h2>{markdown ? <SafeMarkdown source={markdown} /> : <p className="text-sm text-muted-foreground">Your formatted story will appear here as you write.</p>}</Card>
          </div>
          <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground"><span>Markdown formatting supported: headings, bold, quotes, and lists.</span><span>{markdown.length.toLocaleString()} / 30,000</span></div>
        </section> : <>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
            <div>
              <div className="mb-3 text-[10px] font-semibold uppercase tracking-[.2em] text-primary">{tab === "explore" ? "The publication" : tab === "workspace" ? "Editorial studio" : "Your publication"}</div>
              <h1 className="font-editorial text-4xl font-medium tracking-[-.035em] md:text-6xl">{tab === "explore" ? "Stories worth your time" : tab === "review" ? "Review queue" : tab === "scheduled" ? "Coming up" : tab === "published" ? "Published stories" : tab === "comments" ? "Reader comments" : tab === "team" ? "Your team" : "Your desk"}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{tab === "explore" ? "Discover the latest from our writers." : tab === "review" ? "A thoughtful final read before publication." : tab === "scheduled" ? "Stories in line to go live." : tab === "workspace" ? "A clear view of the work in motion." : "A calm place to make and share thoughtful work."}</p>
            </div>
            {tab === "explore" ? <label className="flex h-11 w-full max-w-sm items-center gap-2 rounded-xl border border-border/80 bg-card px-3 shadow-sm"><IconSearch size={17} className="shrink-0 text-muted-foreground" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search stories or tags" aria-label="Search stories or tags" className="h-9 min-w-0 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0" /></label> : tab === "workspace" && latestPublished ? <Link to={`/posts/${latestPublished.slug}`} className="group min-w-[min(100%,300px)] rounded-2xl border border-border/80 bg-card px-5 py-4 shadow-sm transition hover:border-primary/30 hover:shadow-md"><div className="mb-2 flex items-center justify-between gap-6 text-[10px] font-semibold uppercase tracking-[.16em] text-primary"><span>Most recent story</span><IconArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></div><p className="line-clamp-1 font-editorial text-xl font-medium">{latestPublished.title}</p><p className="mt-1 text-xs text-muted-foreground">Published {new Date(latestPublished.publishedAt ?? latestPublished.updatedAt).toLocaleDateString()}</p></Link> : null}
          </div>

          {tab === "workspace" && <div className="mb-8 grid gap-3 sm:grid-cols-3">{[["Drafts", posts.filter((p: any) => p.status === "draft").length, "Ready when you are", IconPencil], ["In review", posts.filter((p: any) => p.status === "in_review").length, "Awaiting a decision", IconMessageCircle], ["Published", posts.filter((p: any) => p.status === "published").length, "Out in the world", IconEye]].map(([label, count, caption, Icon]: any) => <Card key={label} className="group relative overflow-hidden rounded-2xl border-border/80 bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"><div className="absolute inset-y-0 left-0 w-1 bg-primary/35 transition-colors group-hover:bg-primary"/><div className="flex items-center justify-between"><span className="text-sm font-medium text-muted-foreground">{label}</span><span className="grid size-9 place-items-center rounded-xl bg-primary/8 text-primary"><Icon size={18} /></span></div><div className="mt-3 font-sans text-4xl font-semibold tracking-tight">{count}</div><div className="mt-1 text-xs text-muted-foreground">{caption}</div></Card>)}</div>}

          {error && <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}
          {tab === "explore" ? <section className="grid gap-4 lg:grid-cols-2">{publicPosts.map((post: any) => <Link key={post.id} to={`/posts/${post.slug}`} className="group rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg"><div className="mb-4 flex items-center justify-between text-xs text-muted-foreground"><span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "Recently"}</span><IconArrowUpRight size={17} className="transition group-hover:text-primary" /></div><h2 className="font-editorial text-3xl font-medium leading-tight">{post.title}</h2><p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{post.excerpt}</p><div className="mt-5 flex flex-wrap gap-2">{post.tags.split(",").filter(Boolean).map((tag: string) => <Badge key={tag} variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">{tag.trim()}</Badge>)}</div></Link>)}{publicPosts.length === 0 && <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground lg:col-span-2">No published stories match that search.</div>}</section>
          : tab === "comments" ? <CommentsPanel />
          : tab === "team" ? <TeamPanel />
          : <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border px-5 py-4"><h2 className="font-medium">{tab === "review" ? "Submitted for review" : tab === "scheduled" ? "Scheduled stories" : tab === "published" ? "Live stories" : "Recent stories"}</h2><span className="text-xs text-muted-foreground">{visiblePosts.length} {visiblePosts.length === 1 ? "story" : "stories"}</span></div>
            {isLoading ? <div className="p-10 text-center text-sm text-muted-foreground">Loading stories…</div> : visiblePosts.length === 0 ? <div className="flex flex-col items-center px-6 py-16 text-center"><span className="mb-4 grid size-14 place-items-center rounded-2xl bg-primary/8 text-primary"><IconBook2 size={24} /></span><h3 className="font-editorial text-2xl font-medium">{tab === "review" ? "Nothing to review" : "A blank page is a beginning"}</h3><p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{tab === "review" ? "Submitted stories will appear here when an author is ready." : "Start with an idea. Your drafts and submissions will stay right here."}</p>{tab === "workspace" && <Button onClick={startNew} className="mt-5 rounded-xl px-5">Write your first story</Button>}</div> : <div className="divide-y divide-border/80">{visiblePosts.map((post: any) => <article key={post.id} className="grid gap-3 px-5 py-5 transition-colors hover:bg-secondary/25 md:grid-cols-[minmax(0,1fr)_150px_210px] md:items-center md:px-6"><div className="min-w-0"><button onClick={() => startEdit(post)} className="text-left font-editorial text-xl font-medium hover:text-primary">{post.title}</button><p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{post.excerpt || "No preview text yet."}</p><p className="mt-2 text-xs text-muted-foreground">{post.authorEmail} · updated {new Date(post.updatedAt).toLocaleDateString()}</p></div><div><Badge variant={post.status === "published" ? "default" : post.status === "in_review" ? "secondary" : "outline"} className={`rounded-full px-3 py-1 text-xs font-medium ${statusClasses[post.status] ?? ""}`}>{statusText[post.status] ?? post.status}</Badge>{post.status === "scheduled" && post.scheduledAt && <p className="mt-1 text-xs text-muted-foreground">{new Date(post.scheduledAt).toLocaleString()}</p>}</div><div className="flex flex-wrap items-center gap-2">{post.status === "draft" && <button onClick={() => submitDraft(post)} className="rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-secondary">Submit for review</button>}{post.status === "in_review" && canEdit && <><input aria-label="Schedule publish time" type="datetime-local" value={schedule} onChange={e => setSchedule(e.target.value)} className="w-[145px] rounded-lg border border-border bg-background px-2 py-2 text-xs"/><button onClick={() => publish(post)} className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground">{schedule ? "Schedule" : "Publish now"}</button></>}{post.status === "published" && <Link to={`/posts/${post.slug}`} className="inline-flex items-center gap-1 text-xs font-medium text-primary">View story <IconChevronRight size={14} /></Link>}</div></article>)}</div>}
          </section>}
        </>}
      </main>
    </div>
  </div>;
}

function CommentsPanel() {
  const { data: posts = [] } = useActionQuery("list-posts", {});
  const [postId, setPostId] = useState("");
  const selected = postId || (posts as any[])[0]?.id || "";
  const { data: comments = [] } = useActionQuery("list-comments", { postId: selected || "00000000-0000-4000-8000-000000000000" });
  const moderate = useActionMutation("moderate-comment");
  const [busy, setBusy] = useState("");
  return <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4"><div><h2 className="font-medium">Comment moderation</h2><p className="mt-1 text-xs text-muted-foreground">Comments stay private until approved.</p></div><Select value={selected} onValueChange={setPostId}><SelectTrigger className="w-full max-w-sm rounded-xl bg-background"><SelectValue placeholder="Choose a story" /></SelectTrigger><SelectContent>{(posts as any[]).map(post => <SelectItem key={post.id} value={post.id}>{post.title}</SelectItem>)}</SelectContent></Select></div><div className="divide-y divide-border">{(comments as any[]).filter(c => c.status === "pending").map(comment => <div key={comment.id} className="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between"><div><div className="text-sm font-medium">{comment.authorName} <Badge variant="secondary" size="sm" className="ml-2 rounded-full border border-border bg-secondary text-muted-foreground">Pending</Badge></div><p className="mt-1 text-sm leading-6 text-muted-foreground">{comment.body}</p></div><div className="flex shrink-0 gap-2"><Button size="sm" disabled={busy === comment.id} onClick={async () => { setBusy(comment.id); await moderate.mutate({ id: comment.id, approve: true }); setBusy(""); }} className="gap-1.5 rounded-lg"><IconCheck size={14} /> Approve</Button><Button size="sm" variant="outline" disabled={busy === comment.id} onClick={async () => { setBusy(comment.id); await moderate.mutate({ id: comment.id, approve: false }); setBusy(""); }} className="gap-1.5 rounded-lg"><IconX size={14} /> Delete</Button></div></div>)}{comments.length === 0 && <div className="p-10 text-center text-sm text-muted-foreground">No comments awaiting moderation.</div>}</div></section>;
}

function TeamPanel() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"author" | "editor" | "admin">("author");
  const [message, setMessage] = useState("");
  const setBlogRole = useActionMutation("set-blog-role");
  return <section className="max-w-xl rounded-2xl border border-border bg-card p-6"><h2 className="font-editorial text-3xl font-medium">Invite your editorial team</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Team members sign in first, then an admin can assign their role.</p><form className="mt-6 space-y-4" onSubmit={async e => { e.preventDefault(); setMessage(""); try { await setBlogRole.mutate({ email, role }); setMessage(`${email} is now an ${role}.`); setEmail(""); } catch (err) { setMessage(err instanceof Error ? err.message : "Could not update role."); } }}><label className="block text-sm font-medium">Team member email<Input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="mt-2 rounded-xl bg-background font-normal" placeholder="editor@example.com" /></label><label className="block text-sm font-medium">Role<Select value={role} onValueChange={value => setRole(value as "author" | "editor" | "admin")}><SelectTrigger className="mt-2 rounded-xl bg-background font-normal"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="author">Author</SelectItem><SelectItem value="editor">Editor</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent></Select></label><Button type="submit" className="rounded-xl px-4">Assign role</Button>{message && <p className="text-sm text-muted-foreground">{message}</p>}</form></section>;
}

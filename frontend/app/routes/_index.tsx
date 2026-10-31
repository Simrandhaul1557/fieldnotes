import { useActionQuery } from "@agent-native/core/client/hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { IconArrowDown, IconArrowUpRight, IconBook2, IconClock, IconSearch } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";

export function meta() {
  return [
    { title: "Fieldnotes — stories worth your time" },
    { name: "description", content: "Thoughtful stories for curious people." },
  ];
}

export default function HomeRoute() {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const { data: posts = [], isLoading } = useActionQuery("list-public-posts", { query });
  const tags = useMemo(() => [...new Set(posts.flatMap((post: any) => post.tags.split(",").map((tag: string) => tag.trim()).filter(Boolean)))].slice(0, 6), [posts]);
  const visiblePosts = activeTag ? posts.filter((post: any) => post.tags.split(",").some((tag: string) => tag.trim() === activeTag)) : posts;
  const featured = posts[0];

  return <main className="min-h-screen overflow-hidden bg-background">
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between px-5 md:px-10">
        <Link to="/" className="flex items-center gap-3" aria-label="Fieldnotes home">
          <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm"><IconBook2 size={20} stroke={1.8} /></span>
          <span className="font-editorial text-[24px] font-semibold tracking-tight">Fieldnotes<span className="text-primary">.</span></span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#stories" className="text-sm text-muted-foreground transition hover:text-foreground">Stories</a>
          <a href="#about" className="text-sm text-muted-foreground transition hover:text-foreground">Our point of view</a>
          <a href="/rss.xml" className="text-sm text-muted-foreground transition hover:text-foreground">RSS</a>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" asChild className="hidden rounded-xl sm:inline-flex"><Link to="/signup">Write with us</Link></Button>
          <Button asChild className="rounded-xl px-4"><Link to="/signup">Sign in</Link></Button>
        </div>
      </div>
    </header>

    <section className="relative isolate mx-auto grid max-w-[1320px] items-center gap-12 px-5 pb-20 pt-12 md:min-h-[680px] md:grid-cols-[1.02fr_.98fr] md:gap-12 md:px-10 md:pb-24 md:pt-16">
      <div className="pointer-events-none absolute -left-48 top-20 -z-10 size-[30rem] rounded-full bg-primary/[.035] blur-3xl" />
      <div className="relative z-10">
        <Badge variant="secondary" className="mb-7 gap-2 rounded-full border border-primary/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[.13em] text-primary"><span className="size-1.5 rounded-full bg-primary" /> An independent journal</Badge>
        <h1 className="max-w-[700px] font-editorial text-[clamp(3.4rem,6.3vw,6.4rem)] font-normal leading-[.88] tracking-[-.055em] text-foreground">A little more<br />room to <span className="italic text-primary">notice.</span></h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground md:text-lg md:leading-8">Fieldnotes is a home for thoughtful stories about how we live, what we make, and the details that make a day feel like our own.</p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button asChild size="lg" className="h-12 gap-2 rounded-xl px-5 shadow-sm"><a href="#stories">Explore the stories <IconArrowDown size={17} /></a></Button>
          <span className="text-sm text-muted-foreground">A slower scroll, by design.</span>
        </div>
        <div className="mt-10 flex items-center gap-4 border-t border-border/80 pt-5 text-sm text-muted-foreground"><span className="flex -space-x-2"><span className="grid size-8 place-items-center rounded-full border-2 border-background bg-secondary font-sans text-xs text-secondary-foreground">M</span><span className="grid size-8 place-items-center rounded-full border-2 border-background bg-accent font-sans text-xs text-accent-foreground">L</span><span className="grid size-8 place-items-center rounded-full border-2 border-background bg-muted font-sans text-xs text-foreground">J</span></span><span>Made by people who care about the details.</span></div>
      </div>
      <div className="relative mx-auto w-full max-w-[590px] md:ml-auto">
        <div className="absolute -right-4 top-8 hidden h-[88%] w-[88%] rotate-3 rounded-[2rem] border border-primary/20 md:block" />
        <div className="absolute -bottom-6 -left-6 hidden size-36 rounded-full border border-primary/15 md:block" />
        <div className="group relative flex h-[420px] flex-col overflow-hidden rounded-[2rem] border border-[#d9dfd1]/25 bg-[#d9dfd1] p-6 text-[#26352d] shadow-[0_30px_90px_-34px_rgba(0,0,0,.85)] sm:h-[500px] sm:p-8 md:h-[550px]">
          <div className="absolute -right-20 top-12 size-[330px] rounded-full border border-[#607260]/20 sm:size-[390px]" />
          <div className="absolute -right-2 top-28 size-[250px] rounded-full border border-[#607260]/25 sm:right-3 sm:size-[300px]" />
          <div className="absolute right-12 top-40 size-40 rounded-full bg-[#b7c2ad] sm:right-16 sm:top-44 sm:size-52" />
          <div className="absolute right-[22%] top-[39%] size-14 rounded-full bg-[#c77950] shadow-[0_0_0_12px_rgba(199,121,80,.12)] sm:size-16" />
          <div className="relative z-10 flex items-center justify-between border-b border-[#26352d]/20 pb-4 text-[10px] font-semibold uppercase tracking-[.17em] sm:text-[11px]">
            <span>Fieldnotes · Journal</span>
            <span>Vol. 01 / Independent</span>
          </div>
          <div className="relative z-10 flex flex-1 flex-col justify-center pb-4">
            <span className="mb-4 text-[10px] font-semibold uppercase tracking-[.2em] text-[#526253] sm:text-[11px]">An exercise in noticing</span>
            <h2 className="font-editorial text-[clamp(3.2rem,6.5vw,5.2rem)] font-medium leading-[.82] tracking-[-.055em]">Little things,<br /><span className="italic">closely.</span></h2>
            <span className="mt-5 inline-flex w-fit items-center gap-2 rounded-full border border-[#26352d]/20 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[.16em] sm:text-[10px]"><span className="size-1.5 rounded-full bg-[#c77950]" /> Stories for the in-between</span>
          </div>
          {featured ? <Link to={`/posts/${featured.slug}`} className="relative z-10 flex items-center justify-between gap-4 rounded-2xl border border-[#26352d]/15 bg-[#eef0e8]/85 p-4 shadow-sm backdrop-blur-md transition hover:bg-[#f4f5ef] sm:p-5"><div className="min-w-0"><span className="mb-1 block text-[9px] font-semibold uppercase tracking-[.18em] text-[#687568]">Editor's pick</span><span className="block truncate font-editorial text-xl font-medium leading-tight sm:text-2xl">{featured.title}</span></div><span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#26352d] text-[#eef0e8] transition-transform group-hover:translate-x-0.5"><IconArrowUpRight size={18} /></span></Link> : <div className="relative z-10 rounded-2xl border border-[#26352d]/15 bg-[#eef0e8]/85 p-4"><span className="block text-[9px] font-semibold uppercase tracking-[.18em] text-[#687568]">Coming soon</span><span className="font-editorial text-xl font-medium">A fresh page awaits.</span></div>}
        </div>
      </div>
    </section>

    <section id="about" className="border-y border-border/70 bg-card/60">
      <div className="mx-auto grid max-w-[1320px] gap-5 px-5 py-8 md:grid-cols-[1fr_auto] md:items-center md:px-10 md:py-9">
        <p className="max-w-3xl font-editorial text-2xl leading-relaxed text-foreground md:text-3xl">“The ordinary world is full of things we do not yet know how to see.”</p>
        <span className="text-xs font-semibold uppercase tracking-[.15em] text-muted-foreground">A note to read closely</span>
      </div>
    </section>

    <section id="stories" className="mx-auto max-w-[1320px] px-5 py-16 md:px-10 md:py-24">
      <div className="mb-9 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div><div className="mb-3 text-xs font-semibold uppercase tracking-[.16em] text-primary">From the journal</div><h2 className="font-editorial text-4xl font-medium tracking-tight md:text-5xl">Latest stories</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Essays, observations, and ideas worth carrying with you.</p></div>
        <label className="flex h-11 w-full max-w-sm items-center gap-2 rounded-xl border border-border/80 bg-card px-3 shadow-sm focus-within:ring-2 focus-within:ring-ring/30"><IconSearch size={17} className="shrink-0 text-muted-foreground" /><Input value={query} onChange={event => { setQuery(event.target.value); setActiveTag(""); }} placeholder="Search stories or tags" aria-label="Search stories or tags" className="h-9 min-w-0 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0" /></label>
      </div>
      {tags.length > 0 && <div className="mb-7 flex gap-2 overflow-x-auto pb-1">{["All stories", ...tags].map(tag => <Button key={tag} variant={tag === (activeTag || "All stories") ? "secondary" : "ghost"} size="sm" onClick={() => setActiveTag(tag === "All stories" ? "" : tag)} className={`shrink-0 rounded-full px-4 ${tag === (activeTag || "All stories") ? "font-semibold text-primary" : "text-muted-foreground"}`}>{tag}</Button>)}</div>}
      {isLoading ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"><div className="h-72 animate-pulse rounded-2xl bg-secondary"/><div className="h-72 animate-pulse rounded-2xl bg-secondary"/><div className="h-72 animate-pulse rounded-2xl bg-secondary"/></div> : visiblePosts.length === 0 ? <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center"><IconBook2 size={25} className="mx-auto text-primary/70"/><p className="mt-3 font-sans text-xl font-semibold">No stories found</p><p className="mt-1 text-sm text-muted-foreground">Try another search or come back for the next edition.</p></div> : <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{visiblePosts.map((post: any, index: number) => <Card key={post.id} className="group flex h-full flex-col overflow-hidden rounded-2xl border-border/80 bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"><div className={`h-1.5 ${index % 3 === 0 ? "bg-primary" : index % 3 === 1 ? "bg-muted-foreground/40" : "bg-border"}`} /><Link to={`/posts/${post.slug}`} className="flex flex-1 flex-col p-6 outline-none focus-visible:ring-2 focus-visible:ring-ring"><div className="mb-5 flex items-center justify-between gap-3"><Badge variant="secondary" className="max-w-[75%] truncate rounded-full px-3 py-1 text-[11px] font-medium">{post.tags.split(",")[0]?.trim() || "Fieldnotes"}</Badge><span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground"><IconClock size={14}/>{Math.max(1, Math.ceil(post.markdown.trim().split(/\s+/).filter(Boolean).length / 220))} min</span></div><h3 className="font-sans text-[25px] font-semibold leading-[1.15] tracking-tight transition-colors group-hover:text-primary">{post.title}</h3><p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{post.excerpt}</p><div className="mt-auto flex items-center justify-between pt-7 text-xs text-muted-foreground"><span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString(undefined, { month: "long", day: "numeric" }) : "Recently"}</span><span className="inline-flex items-center gap-1 font-medium text-primary">Read story <IconArrowUpRight size={14}/></span></div></Link></Card>)}</div>}
    </section>

    <section className="px-5 pb-16 md:px-10 md:pb-24">
      <div className="mx-auto flex max-w-[1320px] flex-col items-start justify-between gap-6 rounded-[28px] bg-primary px-7 py-9 text-primary-foreground md:flex-row md:items-center md:px-12 md:py-11">
        <div><div className="mb-2 text-xs font-semibold uppercase tracking-[.16em] text-primary-foreground/70">For the curious</div><h2 className="max-w-xl font-editorial text-4xl font-medium leading-tight md:text-5xl">Have a story you can’t stop thinking about?</h2><p className="mt-3 max-w-xl text-sm leading-6 text-primary-foreground/75">We’d love to read what you’re working on.</p></div>
        <Button asChild variant="secondary" size="lg" className="h-12 shrink-0 gap-2 rounded-xl px-5 text-primary"><Link to="/signup">Join the writers <IconArrowUpRight size={17}/></Link></Button>
      </div>
    </section>

    <footer className="border-t border-border/80">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-4 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between md:px-10"><Link to="/" className="font-editorial text-xl font-semibold text-foreground">Fieldnotes<span className="text-primary">.</span></Link><span>Stories for the moments in between.</span><Link to="/signup" className="transition hover:text-primary">Editorial sign in <IconArrowUpRight size={14} className="inline"/></Link></div>
    </footer>
  </main>;
}

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link2, Copy, Check, Zap, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Shorty — Custom URL Shortener" },
      { name: "description", content: "Create memorable short links with your own custom slug. Free, fast, and deployable on Vercel or Cloudflare Workers." },
      { property: "og:title", content: "Shorty — Custom URL Shortener" },
      { property: "og:description", content: "Create memorable short links with your own custom slug." },
    ],
  }),
  component: Home,
});

type Link = {
  id: string;
  slug: string;
  target_url: string;
  clicks: number;
  created_at: string;
};

function Home() {
  const [url, setUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recent, setRecent] = useState<Link[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const [origin, setOrigin] = useState("");
  useEffect(() => { setOrigin(window.location.origin); }, []);


  const loadRecent = async () => {
    const { data } = await supabase
      .from("short_links")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(8);
    if (data) setRecent(data as Link[]);
  };

  useEffect(() => { loadRecent(); }, []);

  const randomSlug = () =>
    Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 4);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let target = url.trim();
    if (!/^https?:\/\//i.test(target)) target = "https://" + target;
    try { new URL(target); } catch { setError("Invalid URL"); return; }

    const finalSlug = (slug.trim() || randomSlug()).toLowerCase();
    if (!/^[a-zA-Z0-9_-]{1,64}$/.test(finalSlug)) {
      setError("Slug can only contain letters, numbers, - and _");
      return;
    }

    setLoading(true);
    const { error: insertErr } = await supabase
      .from("short_links")
      .insert({ slug: finalSlug, target_url: target });
    setLoading(false);

    if (insertErr) {
      setError(insertErr.code === "23505" ? "That custom name is already taken" : insertErr.message);
      return;
    }

    setUrl("");
    setSlug("");
    loadRecent();
    copy(`${origin}/${finalSlug}`);
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <main
      className="min-h-screen"
      style={{ background: "var(--gradient-hero), var(--color-background)" }}
    >
      <div className="mx-auto max-w-3xl px-5 py-12 md:py-20">
        <header className="mb-12 flex items-center gap-2">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary"
            style={{ boxShadow: "var(--shadow-glow)" }}
          >
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight">shorty</span>
        </header>

        <section className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Short links,<br />
            <span className="text-primary">your way.</span>
          </h1>
          <p className="mt-4 max-w-lg text-base text-muted-foreground md:text-lg">
            Pick a custom name or let us generate one. Share a clean,
            memorable URL in seconds.
          </p>
        </section>

        <form
          onSubmit={submit}
          className="rounded-2xl border bg-card p-5 shadow-2xl md:p-6"
        >
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Long URL
          </label>
          <div className="mb-4 flex items-center gap-2 rounded-lg border bg-input px-3">
            <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              placeholder="https://example.com/some/very/long/path"
              className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Custom name <span className="normal-case text-muted-foreground/70">(optional)</span>
          </label>
          <div className="flex items-stretch gap-2 rounded-lg border bg-input pl-3 font-mono text-sm">
            <span className="flex items-center text-muted-foreground">
              {origin.replace(/^https?:\/\//, "")}/
            </span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="my-link"
              maxLength={64}
              pattern="[a-zA-Z0-9_\-]+"
              className="flex-1 bg-transparent py-3 outline-none placeholder:text-muted-foreground"
            />
          </div>

          {error && (
            <p className="mt-3 text-sm text-destructive">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            style={{ boxShadow: "var(--shadow-glow)" }}
          >
            {loading ? "Creating..." : "Shorten URL"}
          </button>
        </form>

        {recent.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Recent links
            </h2>
            <ul className="space-y-2">
              {recent.map((link) => {
                const shortUrl = `${origin}/${link.slug}`;
                return (
                  <li
                    key={link.id}
                    className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <a
                        href={shortUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="block truncate font-mono text-sm text-primary hover:underline"
                      >
                        /{link.slug}
                      </a>
                      <p className="truncate text-xs text-muted-foreground">
                        {link.target_url}
                      </p>
                    </div>
                    <span className="hidden text-xs text-muted-foreground sm:inline">
                      {link.clicks} clicks
                    </span>
                    <button
                      onClick={() => copy(shortUrl)}
                      className="rounded-md border p-2 transition hover:bg-secondary"
                      aria-label="Copy"
                    >
                      {copied === shortUrl ? (
                        <Check className="h-4 w-4 text-primary" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                    <a
                      href={shortUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-md border p-2 transition hover:bg-secondary"
                      aria-label="Open"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <footer className="mt-16 text-center text-xs text-muted-foreground">
          Deployable on Vercel & Cloudflare Workers.
        </footer>
      </div>
    </main>
  );
}

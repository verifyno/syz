import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Link2, Copy, Check, Zap, ExternalLink, X } from "lucide-react";

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

function Home() {
  const [url, setUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const [origin, setOrigin] = useState("");
  useEffect(() => { setOrigin(window.location.origin); }, []);

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
    setResultUrl(`${origin}/${finalSlug}`);
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const close = () => {
    setResultUrl(null);
    setCopied(false);
  };

  return (
    <main
      className="min-h-screen"
      style={{ background: "var(--gradient-hero), var(--color-background)" }}
    >
      <div className="mx-auto max-w-3xl px-5 py-12 md:py-20">
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 flex items-center gap-2"
        >
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary"
            style={{ boxShadow: "var(--shadow-glow)" }}
          >
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight">shorty</span>
        </motion.header>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Short links,<br />
            <span className="text-primary">your way.</span>
          </h1>
          <p className="mt-4 max-w-lg text-base text-muted-foreground md:text-lg">
            Pick a custom name or let us generate one. Share a clean,
            memorable URL in seconds.
          </p>
        </motion.section>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          onSubmit={submit}
          className="rounded-2xl border bg-card p-5 shadow-2xl md:p-6"
        >
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Long URL
          </label>
          <div className="mb-4 flex items-center gap-2 rounded-lg border bg-input px-3 transition-colors focus-within:border-primary">
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
          <div className="flex items-stretch gap-2 rounded-lg border bg-input pl-3 font-mono text-sm transition-colors focus-within:border-primary">
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

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="text-sm text-destructive"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            style={{ boxShadow: "var(--shadow-glow)" }}
          >
            {loading ? "Creating..." : "Shorten URL"}
          </motion.button>
        </motion.form>

        <footer className="mt-16 text-center text-xs text-muted-foreground">
          Deployable on Vercel & Cloudflare Workers.
        </footer>
      </div>

      <AnimatePresence>
        {resultUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={close}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-md sm:items-center"
          >
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-t-3xl border bg-card p-6 shadow-2xl sm:rounded-3xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <motion.div
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-primary"
                    style={{ boxShadow: "var(--shadow-glow)" }}
                  >
                    <Check className="h-4 w-4 text-primary-foreground" strokeWidth={3} />
                  </motion.div>
                  <h3 className="text-base font-semibold">Link ready</h3>
                </div>
                <button
                  onClick={close}
                  className="rounded-full p-1.5 text-muted-foreground transition hover:bg-secondary"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">
                Your short link
              </p>
              <div className="mb-4 flex items-center gap-2 rounded-xl border bg-input px-3 py-3 font-mono text-sm">
                <span className="flex-1 truncate text-foreground">{resultUrl}</span>
              </div>

              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => copy(resultUrl)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                  style={{ boxShadow: "var(--shadow-glow)" }}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {copied ? (
                      <motion.span
                        key="copied"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="flex items-center gap-2"
                      >
                        <Check className="h-4 w-4" /> Copied
                      </motion.span>
                    ) : (
                      <motion.span
                        key="copy"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="flex items-center gap-2"
                      >
                        <Copy className="h-4 w-4" /> Copy
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
                <motion.a
                  whileTap={{ scale: 0.96 }}
                  href={resultUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl border bg-secondary px-4 py-3 text-sm font-semibold transition hover:opacity-90"
                >
                  <ExternalLink className="h-4 w-4" />
                </motion.a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

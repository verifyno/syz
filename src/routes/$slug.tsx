import { createFileRoute, notFound } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export const Route = createFileRoute("/$slug")({
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .from("short_links")
      .select("slug, target_url, clicks")
      .eq("slug", params.slug.toLowerCase())
      .maybeSingle();
    if (error || !data) throw notFound();
    return data;
  },
  component: Redirector,
  notFoundComponent: NotFound,
});

function Redirector() {
  const link = Route.useLoaderData();

  useEffect(() => {
    // Fire-and-forget click increment, then redirect
    supabase
      .from("short_links")
      .update({ clicks: link.clicks + 1 })
      .eq("slug", link.slug)
      .then(() => {});
    window.location.replace(link.target_url);
  }, [link]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">
          Redirecting to{" "}
          <span className="font-mono text-foreground">{link.target_url}</span>
        </p>
      </div>
    </main>
  );
}

function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold">404</h1>
        <p className="mt-2 text-muted-foreground">This short link doesn't exist.</p>
        <a href="/" className="mt-6 inline-block text-sm text-primary hover:underline">
          ← Create a new one
        </a>
      </div>
    </main>
  );
}

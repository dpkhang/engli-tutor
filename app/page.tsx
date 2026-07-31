"use client";
import { useQuery } from "@tanstack/react-query";
import { LandingPageForm } from "@/components/landing-page-form";
import { getLandingPages } from "@/lib/api";
export default function Home() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["landing-pages"],
    queryFn: getLandingPages,
  });
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <p className="mb-2 text-sm font-semibold text-primary">LANDING PAGE GENERATOR</p>
      <h1 className="mb-8 text-4xl font-bold tracking-tight">Quản lý landing page</h1>
      <LandingPageForm />
      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold">Landing pages</h2>
        {isLoading && <p className="text-muted-foreground">Đang tải...</p>}
        {isError && (
          <p className="text-red-600">Không thể kết nối backend. Kiểm tra `NEXT_PUBLIC_API_URL`.</p>
        )}
        <div className="grid gap-3">
          {data?.map((page) => (
            <article
              key={page.id}
              className="flex items-center justify-between rounded-xl border p-4"
            >
              <div>
                <h3 className="font-medium">{page.name}</h3>
                <p className="text-sm text-muted-foreground">/{page.slug}</p>
              </div>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                {page.status}
              </span>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

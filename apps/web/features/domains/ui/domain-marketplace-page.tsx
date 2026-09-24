"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@engli-tutor/ui";
import { PageHeader } from "@/features/layout";
import { domainHooks } from "../hooks";

function formatVnd(value: number) {
  return `${value.toLocaleString("en-US")}`;
}

export function DomainMarketplacePage() {
  const search = domainHooks.useSearch();
  const purchase = domainHooks.usePurchase();
  const [years, setYears] = useState(1);
  const [purchasingHostname, setPurchasingHostname] = useState<string | null>(null);

  const searchDomains = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const q = String(form.get("domainQuery") ?? "").trim();
    if (q) search.mutate({ q, years });
  };

  const purchaseDomain = async (result: NonNullable<typeof search.data>["results"][number]) => {
    setPurchasingHostname(result.hostname);
    try {
      const checkout = await purchase.mutateAsync({
        hostname: result.hostname,
        years: result.years,
        quoteToken: result.quoteToken,
        autoRenew: true,
      });
      if (!checkout.url) throw new Error("Could not create domain checkout session");
      window.location.assign(checkout.url);
    } catch {
      setPurchasingHostname(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-5">
        <Link
          href="/domains"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="size-4" /> Domain list
        </Link>
        <PageHeader
          eyebrow="Domain marketplace"
          title="Find a domain to buy"
          description="Check domain availability, get pricing, and register for the workspace."
        />
      </div>

      <Card className="shadow-none">
        <CardContent>
          <form
            className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_8rem_auto] sm:items-start"
            onSubmit={searchDomains}
          >
            <div className="grid min-w-0 grid-rows-[1rem_2.25rem] gap-2">
              <Label htmlFor="domain-search" className="h-4 leading-4">Desired domain</Label>
              <Input
                id="domain-search"
                name="domainQuery"
                placeholder="pagecraft or pagecraft.com"
                required
                autoComplete="off"
                autoFocus
                className="h-9"
              />
            </div>
            <div className="grid grid-rows-[1rem_2.25rem] gap-2">
              <Label htmlFor="domain-years" className="h-4 leading-4">Term</Label>
              <Select value={String(years)} onValueChange={(value) => setYears(Number(value))}>
                <SelectTrigger id="domain-years" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" align="start" className="w-[var(--radix-select-trigger-width)]">
                  {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
                    <SelectItem key={value} value={String(value)}>
                      {value} {value === 1 ? "year" : "years"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:grid sm:grid-rows-[1rem_2.25rem] sm:gap-2">
              <span aria-hidden className="hidden h-4 sm:block" />
              <Button disabled={search.isPending} className="h-9">
                <Search /> {search.isPending ? "Searching..." : "Search domain"}
              </Button>
            </div>
          </form>

          <div className="min-h-5">
            {search.error ? (
              <p className="mt-4 text-sm text-destructive" role="alert">
                {search.error.message}
              </p>
            ) : null}
            {purchase.error ? (
              <p className="mt-4 text-sm text-destructive" role="alert">
                {purchase.error.message}
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {search.data ? (
        <section>
          <div className="flex items-center justify-between border-b pb-3 text-sm">
            <h2 className="font-semibold text-foreground">
              {search.data.results.length} results for “{search.data.query}”
            </h2>
            <span className="text-xs text-muted-foreground">Price for {search.data.years} {search.data.years === 1 ? "year" : "years"}</span>
          </div>
          <div className="divide-y">
            {search.data.results.map((result) => (
              <div
                key={result.hostname}
                className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-base font-semibold text-foreground">{result.hostname}</p>
                    {result.premium ? <Badge variant="secondary">Premium</Badge> : null}
                    <Badge variant={result.available ? "default" : "outline"}>
                      {result.available ? "Available to register" : "Taken"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    .{result.tld} · auto-renew
                  </p>
                </div>
                <div className="flex items-center justify-between gap-5 sm:justify-end">
                  <div className="text-right">
                    <p className="text-lg font-semibold text-foreground">
                      {formatVnd(result.retailPriceVnd)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">/{result.years} {result.years === 1 ? "year" : "years"}</p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant={result.available ? "default" : "outline"}
                    disabled={!result.available || purchase.isPending}
                    onClick={() => void purchaseDomain(result)}
                  >
                    {purchasingHostname === result.hostname ? "Processing..." : "Buy"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <div className="border-y border-dashed py-14 text-center">
          <Search className="mx-auto size-7 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">
            Enter a brand name or domain to start searching.
          </p>
        </div>
      )}
    </div>
  );
}

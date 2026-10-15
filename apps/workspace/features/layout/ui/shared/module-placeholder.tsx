"use client";

import { ArrowRight, DatabaseZap } from "lucide-react";
import { Badge, Button, Card, CardContent } from "@engli-tutor/ui";
import { useWorkspaceI18n } from "@/features/i18n";
import { PageHeader } from "./page-header";

export type ModuleCapability = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

export function ModulePlaceholder({
  eyebrow,
  title,
  description,
  capabilities,
}: {
  eyebrow: string;
  title: string;
  description: string;
  capabilities: ModuleCapability[];
}) {
  const t = useWorkspaceI18n();
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        action={<Badge variant="secondary">{t("shell.awaitingApi")}</Badge>}
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {capabilities.map((item) => (
          <Card key={item.title} className="gap-4 shadow-none">
            <CardContent className="space-y-4">
              <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                {item.icon}
              </span>
              <div>
                <h2 className="font-semibold">{item.title}</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.description}</p>
              </div>
              <Button type="button" variant="ghost" size="sm" className="-ml-3" disabled>
                Set up <ArrowRight />
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
      <div className="flex items-start gap-3 rounded-xl border border-dashed bg-card p-5 text-sm text-muted-foreground">
        <DatabaseZap className="mt-0.5 size-5 shrink-0 text-primary" />
        <p>
          {t("shell.modulePlaceholderNote")}
        </p>
      </div>
    </div>
  );
}

"use client";

import { memo, type FormEvent, type ReactNode } from "react";
import {
  Briefcase,
  Building2,
  KeyRound,
  Languages,
  Mail,
  ShieldCheck,
  Target,
  UserRound,
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  cn,
} from "@engli-tutor/ui";
import { PageHeader, DataLoadingState } from "@/features/layout";
import { LEVELS, type SkillLevel } from "@/features/learn/model/skill-exercises";
import { useWorkspaceI18n } from "@/features/i18n/workspace-i18n";
import {
  SettingsCard,
  SettingsCardContent,
  SettingsCardHeader,
  SettingsPanel,
} from "@/features/settings";
import { AccountPhoneInput, getPhoneValidity } from "../account-phone-input";
import { AddressAutocomplete } from "../address-autocomplete";

export type ProfileForm = {
  name: string;
  phone: string;
  jobTitle: string;
  company: string;
  city: string;
  nativeLanguage: string;
  targetLevel: "" | SkillLevel;
  learningGoal: string;
  uiLocale: "en" | "vi";
  tutorExplanationLocale: "en" | "vi";
};

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export type AccountsPageViewProps = {
  embedded: boolean;
  ready: boolean;
  form: ProfileForm | null;
  email: string;
  emailVerified: boolean | undefined;
  addressValid: boolean;
  dirty: boolean;
  savePending: boolean;
  saveError: string | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFieldChange: <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) => void;
  onDiscard: () => void;
  onAddressValidityChange: (valid: boolean) => void;
  onSignOut: () => void;
};

export const AccountsPageView = memo(function AccountsPageView({
  embedded,
  ready,
  form,
  email,
  emailVerified,
  addressValid,
  dirty,
  savePending,
  saveError,
  onSubmit,
  onFieldChange,
  onDiscard,
  onAddressValidityChange,
  onSignOut,
}: AccountsPageViewProps) {
  const t = useWorkspaceI18n();
  const phoneValid = form ? getPhoneValidity(form.phone) : true;
  const canSave =
    Boolean(form?.name.trim()) &&
    !savePending &&
    phoneValid &&
    !(form?.city && !addressValid);

  const body = form ? (
    <div className={cn("grid items-start gap-4 lg:grid-cols-[1.4fr_1fr]", dirty && "pb-28")}>
      <form className="space-y-4" onSubmit={onSubmit}>
        <SettingsCard>
          <SettingsCardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="size-5 text-primary" /> {t("workspace.profile")}
            </CardTitle>
          </SettingsCardHeader>
          <SettingsCardContent className="grid gap-4 [&_input]:h-11 [&_input]:text-base sm:grid-cols-2 sm:[&_input]:h-9 sm:[&_input]:text-sm">
            <Field id="account-name" label={t("workspace.fullName")}>
              <Input
                id="account-name"
                value={form.name}
                autoComplete="name"
                onChange={(event) => onFieldChange("name", event.target.value)}
                required
                maxLength={80}
              />
            </Field>
            <Field
              id="account-email"
              label={t("workspace.email")}
              hint={t("workspace.emailSignInHint")}
            >
              <Input id="account-email" value={email} readOnly />
            </Field>
            <Field
              id="account-phone"
              label={t("workspace.phone")}
              hint={t("workspace.phoneHint")}
            >
              <AccountPhoneInput
                id="account-phone"
                value={form.phone}
                disabled={savePending}
                onChange={(value) => onFieldChange("phone", value)}
              />
            </Field>
            <Field
              id="account-city"
              label={t("workspace.address")}
              hint={t("workspace.addressHint")}
            >
              <AddressAutocomplete
                id="account-city"
                value={form.city}
                disabled={savePending}
                onChange={(value) => onFieldChange("city", value)}
                onValidityChange={onAddressValidityChange}
              />
              {form.city && !addressValid ? (
                <p className="text-xs text-destructive">{t("workspace.chooseAddress")}</p>
              ) : null}
            </Field>
            <Field id="account-job" label={t("workspace.jobTitle")}>
              <div className="relative">
                <Briefcase className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="account-job"
                  className="pl-9"
                  value={form.jobTitle}
                  placeholder={t("workspace.jobTitlePlaceholder")}
                  onChange={(event) => onFieldChange("jobTitle", event.target.value)}
                  maxLength={80}
                />
              </div>
            </Field>
            <Field id="account-company" label={t("workspace.company")}>
              <div className="relative">
                <Building2 className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="account-company"
                  className="pl-9"
                  value={form.company}
                  autoComplete="organization"
                  placeholder={t("workspace.companyName")}
                  onChange={(event) => onFieldChange("company", event.target.value)}
                  maxLength={80}
                />
              </div>
            </Field>
          </SettingsCardContent>
        </SettingsCard>

        <SettingsCard>
          <SettingsCardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="size-5 text-primary" /> {t("workspace.learningProfile")}
            </CardTitle>
          </SettingsCardHeader>
          <SettingsCardContent className="grid gap-4 [&_input]:h-11 [&_input]:text-base sm:grid-cols-2 sm:[&_input]:h-9 sm:[&_input]:text-sm">
            <Field id="account-language" label={t("workspace.nativeLanguage")}>
              <div className="relative">
                <Languages className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="account-language"
                  className="pl-9"
                  value={form.nativeLanguage}
                  placeholder={t("workspace.vietnamese")}
                  onChange={(event) => onFieldChange("nativeLanguage", event.target.value)}
                  maxLength={40}
                />
              </div>
            </Field>
            <Field id="account-ui-locale" label={t("workspace.interfaceLanguage")}>
              <Select value={form.uiLocale} onValueChange={(value) => onFieldChange("uiLocale", value as "en" | "vi")}>
                <SelectTrigger id="account-ui-locale" className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="vi">Tiếng Việt</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field id="account-tutor-locale" label={t("workspace.tutorExplanationLanguage")}>
              <Select value={form.tutorExplanationLocale} onValueChange={(value) => onFieldChange("tutorExplanationLocale", value as "en" | "vi")}>
                <SelectTrigger id="account-tutor-locale" className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="vi">Tiếng Việt</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field
              id="account-level"
              label={t("workspace.targetLevel")}
              hint={t("workspace.targetLevelHint")}
            >
              <Select
                value={form.targetLevel || "none"}
                onValueChange={(value) =>
                  onFieldChange("targetLevel", value === "none" ? "" : (value as SkillLevel))
                }
              >
                <SelectTrigger id="account-level" className="w-full">
                  <SelectValue placeholder={t("workspace.chooseLevel")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("workspace.notSet")}</SelectItem>
                  {LEVELS.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.id} · {level.labelVi}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="account-goal">{t("workspace.learningGoal")}</Label>
              <textarea
                id="account-goal"
                value={form.learningGoal}
                onChange={(event) => onFieldChange("learningGoal", event.target.value)}
                maxLength={280}
                rows={4}
                placeholder={t("workspace.learningGoalPlaceholder")}
                className={cn(
                  "w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs outline-none md:text-sm",
                  "placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/40",
                  "dark:bg-input/30",
                )}
              />
              <p className="text-xs text-muted-foreground">{form.learningGoal.length}/280</p>
            </div>
          </SettingsCardContent>
        </SettingsCard>

        {saveError ? (
          <Alert variant="destructive">
            <AlertDescription>{saveError}</AlertDescription>
          </Alert>
        ) : null}

        {dirty ? (
          <div className="fixed inset-x-0 bottom-0 z-70 border-t border-border/80 bg-background/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-12px_32px_-18px_rgba(15,23,42,0.28)] backdrop-blur-md sm:px-6">
            <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:pr-16 lg:pl-62 lg:pr-4">
              <p className="text-sm text-muted-foreground">{t("workspace.unsavedAccountChanges")}</p>
              <div className="flex w-full gap-2 sm:w-auto sm:shrink-0">
                <Button type="button" variant="outline" className="flex-1 rounded-full sm:flex-none" onClick={onDiscard}>
                  {t("workspace.discard")}
                </Button>
                <Button type="submit" className="flex-1 rounded-full sm:flex-none" disabled={!canSave}>
                  {savePending ? t("workspace.savingChanges") : t("workspace.saveChanges")}
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </form>

      <div className="space-y-4">
        <SettingsCard>
          <SettingsCardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" /> {t("workspace.security")}
            </CardTitle>
          </SettingsCardHeader>
          <SettingsCardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Mail className="size-4" /> Email
              </span>
              <Badge variant={emailVerified ? "secondary" : "outline"}>
                {emailVerified ? t("workspace.verified") : t("workspace.linked")}
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-muted-foreground">
                <KeyRound className="size-4" /> Password
              </span>
              <Badge variant="outline">{t("workspace.inUse")}</Badge>
            </div>
          </SettingsCardContent>
        </SettingsCard>
        <Button type="button" variant="outline" className="w-full" onClick={onSignOut}>
          {t("workspace.signOutSession")}
        </Button>
      </div>
    </div>
  ) : null;

  return (
    <div className="space-y-4">
      {embedded ? null : (
        <PageHeader
          eyebrow={t("workspace.personal")}
          title={t("workspace.account")}
          description={t("workspace.accountDescription")}
        />
      )}
      {embedded ? (
        <SettingsPanel ready={ready}>{body}</SettingsPanel>
      ) : ready ? (
        body
      ) : (
        <DataLoadingState
          title={t("workspace.loadingAccount")}
          description={t("workspace.fetchingProfile")}
          cards={2}
        />
      )}
    </div>
  );
});

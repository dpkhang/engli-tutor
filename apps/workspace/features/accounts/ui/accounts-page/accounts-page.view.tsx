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
              <UserRound className="size-5 text-primary" /> Profile
            </CardTitle>
          </SettingsCardHeader>
          <SettingsCardContent className="grid gap-4 [&_input]:h-11 [&_input]:text-base sm:grid-cols-2 sm:[&_input]:h-9 sm:[&_input]:text-sm">
            <Field id="account-name" label="Full name">
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
              label="Email"
              hint="Email is used to sign in and cannot be changed here."
            >
              <Input id="account-email" value={email} readOnly />
            </Field>
            <Field
              id="account-phone"
              label="Phone"
              hint="Pick a country, then enter the local number. Saved in international format."
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
              label="Address"
              hint="Select a verified suggestion from Google Places."
            >
              <AddressAutocomplete
                id="account-city"
                value={form.city}
                disabled={savePending}
                onChange={(value) => onFieldChange("city", value)}
                onValidityChange={onAddressValidityChange}
              />
              {form.city && !addressValid ? (
                <p className="text-xs text-destructive">Choose an address from the suggestions</p>
              ) : null}
            </Field>
            <Field id="account-job" label="Job title">
              <div className="relative">
                <Briefcase className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="account-job"
                  className="pl-9"
                  value={form.jobTitle}
                  placeholder="Software developer"
                  onChange={(event) => onFieldChange("jobTitle", event.target.value)}
                  maxLength={80}
                />
              </div>
            </Field>
            <Field id="account-company" label="Company">
              <div className="relative">
                <Building2 className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="account-company"
                  className="pl-9"
                  value={form.company}
                  autoComplete="organization"
                  placeholder="Company name"
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
              <Target className="size-5 text-primary" /> Learning profile
            </CardTitle>
          </SettingsCardHeader>
          <SettingsCardContent className="grid gap-4 [&_input]:h-11 [&_input]:text-base sm:grid-cols-2 sm:[&_input]:h-9 sm:[&_input]:text-sm">
            <Field id="account-language" label="Native language">
              <div className="relative">
                <Languages className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="account-language"
                  className="pl-9"
                  value={form.nativeLanguage}
                  placeholder="Vietnamese"
                  onChange={(event) => onFieldChange("nativeLanguage", event.target.value)}
                  maxLength={40}
                />
              </div>
            </Field>
            <Field
              id="account-level"
              label="Target level"
              hint="Used as the default filter on Skills practice."
            >
              <Select
                value={form.targetLevel || "none"}
                onValueChange={(value) =>
                  onFieldChange("targetLevel", value === "none" ? "" : (value as SkillLevel))
                }
              >
                <SelectTrigger id="account-level" className="w-full">
                  <SelectValue placeholder="Choose a level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not set</SelectItem>
                  {LEVELS.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.id} · {level.labelVi}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="account-goal">Learning goal</Label>
              <textarea
                id="account-goal"
                value={form.learningGoal}
                onChange={(event) => onFieldChange("learningGoal", event.target.value)}
                maxLength={280}
                rows={4}
                placeholder="I want to speak more confidently in stand-up meetings."
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
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 pr-16 lg:pl-62 lg:pr-4">
              <p className="text-sm text-muted-foreground">You have unsaved account changes.</p>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" className="rounded-full" onClick={onDiscard}>
                  Discard
                </Button>
                <Button type="submit" className="rounded-full" disabled={!canSave}>
                  {savePending ? "Saving..." : "Save changes"}
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
              <ShieldCheck className="size-5 text-primary" /> Security
            </CardTitle>
          </SettingsCardHeader>
          <SettingsCardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Mail className="size-4" /> Email
              </span>
              <Badge variant={emailVerified ? "secondary" : "outline"}>
                {emailVerified ? "Verified" : "Linked"}
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-muted-foreground">
                <KeyRound className="size-4" /> Password
              </span>
              <Badge variant="outline">In use</Badge>
            </div>
          </SettingsCardContent>
        </SettingsCard>
        <Button type="button" variant="outline" className="w-full" onClick={onSignOut}>
          Sign out of this session
        </Button>
      </div>
    </div>
  ) : null;

  return (
    <div className="space-y-4">
      {embedded ? null : (
        <PageHeader
          eyebrow="Personal"
          title="Account"
          description="Update your profile so lessons and support can match how you learn."
        />
      )}
      {embedded ? (
        <SettingsPanel ready={ready}>{body}</SettingsPanel>
      ) : ready ? (
        body
      ) : (
        <DataLoadingState
          title="Loading account"
          description="Fetching your profile details."
          cards={2}
        />
      )}
    </div>
  );
});

"use client";

import type { ReactNode } from "react";
import { useLayoutEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  cn,
  useActionDialog,
} from "@landing-page-generator/ui";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import { PageHeader, DataLoadingState, useSignOutLoading } from "@/features/layout";
import { ApiError } from "@landing-page-generator/api-client";
import { authClient, useSession } from "@/lib/auth-client";
import { LEVELS, type SkillLevel } from "@/features/learn/model/skill-exercises";
import { accountApi, type AccountProfile } from "../api";
import { queryKeys } from "@/lib/query";
import { setPreferredLevel } from "@/features/settings/model/preferences";
import { SettingsPanel } from "@/features/settings";
import { AddressAutocomplete } from "./address-autocomplete";

type ProfileForm = {
  name: string;
  phone: string;
  jobTitle: string;
  company: string;
  city: string;
  nativeLanguage: string;
  targetLevel: "" | SkillLevel;
  learningGoal: string;
};

const EMPTY_FORM: ProfileForm = {
  name: "",
  phone: "",
  jobTitle: "",
  company: "",
  city: "",
  nativeLanguage: "",
  targetLevel: "",
  learningGoal: "",
};

function profileToForm(profile: AccountProfile, fallbackName = ""): ProfileForm {
  return {
    name: profile.name || fallbackName,
    phone: profile.phone ?? "",
    jobTitle: profile.jobTitle ?? "",
    company: profile.company ?? "",
    city: profile.city ?? "",
    nativeLanguage: profile.nativeLanguage ?? "",
    targetLevel: profile.targetLevel ?? "",
    learningGoal: profile.learningGoal ?? "",
  };
}

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
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export default function AccountsPage({ embedded = false }: { embedded?: boolean }) {
  const dialog = useActionDialog();
  const { beginSignOut, endSignOut } = useSignOutLoading();
  const queryClient = useQueryClient();
  const { data: session, isPending: sessionPending, refetch: refetchSession } = useSession();
  const user = session?.user;
  const [form, setForm] = useState<ProfileForm | null>(null);
  const [addressValid, setAddressValid] = useState(true);

  const profileQuery = useQuery({
    queryKey: queryKeys.account,
    queryFn: accountApi.get,
  });
  const sourcesReady = !sessionPending && (profileQuery.isSuccess || profileQuery.isError);

  useLayoutEffect(() => {
    if (!sourcesReady) return;
    if (profileQuery.data) {
      setForm(profileToForm(profileQuery.data, user?.name ?? ""));
      setAddressValid(true);
      return;
    }
    setForm({ ...EMPTY_FORM, name: user?.name ?? "" });
    setAddressValid(true);
  }, [sourcesReady, profileQuery.data, user?.name]);

  const baseline = useMemo(
    () => (profileQuery.data ? profileToForm(profileQuery.data, user?.name ?? "") : null),
    [profileQuery.data, user?.name],
  );
  const dirty = Boolean(form) && (!baseline || JSON.stringify(form) !== JSON.stringify(baseline));

  const save = useMutation({
    mutationFn: () => {
      if (!form) throw new Error("Profile is still loading");
      if (form.phone && !isValidPhoneNumber(form.phone))
        throw new Error("Enter a valid phone number");
      if (form.city && !addressValid) throw new Error("Choose an address from the suggestions");
      return accountApi.update({
        name: form.name.trim(),
        phone: form.phone,
        jobTitle: form.jobTitle,
        company: form.company,
        city: form.city,
        nativeLanguage: form.nativeLanguage,
        targetLevel: form.targetLevel,
        learningGoal: form.learningGoal,
      });
    },
    onSuccess: async (profile) => {
      queryClient.setQueryData(["account"], profile);
      if (form?.targetLevel) setPreferredLevel(form.targetLevel);
      try {
        await authClient.updateUser({ name: profile.name });
      } catch {
        await refetchSession();
      }
      await dialog.inform({
        title: "Profile saved",
        description: "Your account details are up to date.",
        confirmLabel: "OK",
        tone: "success",
      });
    },
  });

  const signOut = async () => {
    const accepted = await dialog.confirm({
      title: "Sign out?",
      description: "You'll need to sign in again to continue managing the workspace.",
      confirmLabel: "Sign out",
      tone: "danger",
    });
    if (!accepted) return;
    beginSignOut();
    try {
      queryClient.clear();
      await authClient.signOut();
      window.location.assign("/login");
    } catch {
      endSignOut();
    }
  };

  const setField = <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) => {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  };

  const saveError =
    save.error instanceof ApiError
      ? save.error.message
      : save.error
        ? "Couldn't save your profile. Try again."
        : null;
  const ready = form !== null;

  const body = form ? (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <form
        className="space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          if (!form.name.trim() || save.isPending) return;
          save.mutate();
        }}
      >
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="size-5 text-primary" /> Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <Field id="account-name" label="Full name">
              <Input
                id="account-name"
                value={form.name}
                autoComplete="name"
                onChange={(event) => setField("name", event.target.value)}
                required
                maxLength={80}
              />
            </Field>
            <Field
              id="account-email"
              label="Email"
              hint="Email is used to sign in and cannot be changed here."
            >
              <Input
                id="account-email"
                value={user?.email ?? profileQuery.data?.email ?? ""}
                readOnly
              />
            </Field>
            <Field
              id="account-phone"
              label="Phone"
              hint="Choose a country code; the number is stored securely in international format."
            >
              <PhoneInput
                id="account-phone"
                className="account-phone-input"
                data-invalid={Boolean(form.phone) && !isValidPhoneNumber(form.phone)}
                value={form.phone || undefined}
                defaultCountry="VN"
                international
                countryCallingCodeEditable={false}
                autoComplete="tel"
                placeholder="Enter phone number"
                onChange={(value) => setField("phone", value ?? "")}
              />
              {form.phone && !isValidPhoneNumber(form.phone) ? (
                <p className="text-xs text-destructive">Enter a valid phone number</p>
              ) : null}
            </Field>
            <Field
              id="account-city"
              label="Address"
              hint="Select a verified suggestion from Google Places."
            >
              <AddressAutocomplete
                id="account-city"
                value={form.city}
                disabled={save.isPending}
                onChange={(value) => setField("city", value)}
                onValidityChange={setAddressValid}
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
                  onChange={(event) => setField("jobTitle", event.target.value)}
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
                  onChange={(event) => setField("company", event.target.value)}
                  maxLength={80}
                />
              </div>
            </Field>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="size-5 text-primary" /> Learning profile
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <Field id="account-language" label="Native language">
              <div className="relative">
                <Languages className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="account-language"
                  className="pl-9"
                  value={form.nativeLanguage}
                  placeholder="Vietnamese"
                  onChange={(event) => setField("nativeLanguage", event.target.value)}
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
                  setField("targetLevel", value === "none" ? "" : (value as SkillLevel))
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
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="account-goal">Learning goal</Label>
              <textarea
                id="account-goal"
                value={form.learningGoal}
                onChange={(event) => setField("learningGoal", event.target.value)}
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
          </CardContent>
        </Card>

        {saveError ? (
          <Alert variant="destructive">
            <AlertDescription>{saveError}</AlertDescription>
          </Alert>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            disabled={
              !form.name.trim() ||
              !dirty ||
              save.isPending ||
              Boolean(form.phone && !isValidPhoneNumber(form.phone)) ||
              Boolean(form.city && !addressValid)
            }
          >
            {save.isPending ? "Saving..." : "Save changes"}
          </Button>
          {dirty ? <p className="text-xs text-muted-foreground">Unsaved changes</p> : null}
        </div>
      </form>

      <div className="space-y-6">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" /> Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Mail className="size-4" /> Email
              </span>
              <Badge variant={profileQuery.data?.emailVerified ? "secondary" : "outline"}>
                {profileQuery.data?.emailVerified ? "Verified" : "Linked"}
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-muted-foreground">
                <KeyRound className="size-4" /> Password
              </span>
              <Badge variant="outline">In use</Badge>
            </div>
          </CardContent>
        </Card>
        <Button type="button" variant="outline" className="w-full" onClick={() => void signOut()}>
          Sign out of this session
        </Button>
      </div>
    </div>
  ) : null;

  return (
    <div className="space-y-8">
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
}

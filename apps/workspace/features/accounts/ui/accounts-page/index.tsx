"use client";

import { resetAccountAppearance } from "@/features/settings/model/preferences";

import { useCallback, useLayoutEffect, useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActionDialog, useToast } from "@engli-tutor/ui";
import { useSignOutLoading } from "@/features/layout";
import { ApiError } from "@engli-tutor/api-client";
import { authClient, useSession } from "@/lib/auth-client";
import { queryKeys } from "@/lib/query";
import { setPreferredLevel } from "@/features/settings";
import { accountApi, type AccountProfile } from "../../api";
import { getPhoneValidity } from "../account-phone-input";
import { AccountsPageView, type ProfileForm } from "./accounts-page.view";

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

export function AccountsPage({ embedded = false }: { embedded?: boolean }) {
  const dialog = useActionDialog();
  const toast = useToast();
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
      if (!getPhoneValidity(form.phone)) throw new Error("Enter a valid phone number");
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
      toast.success("Profile saved", "Your account details are up to date.");
    },
  });

  const onSignOut = useCallback(async () => {
    const accepted = await dialog.confirm({
      title: "Sign out?",
      description: "You'll need to sign in again to continue managing the workspace.",
      confirmLabel: "Sign out",
      tone: "danger",
    });
    if (!accepted) return;
    beginSignOut();
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error("Sign out failed");
      resetAccountAppearance();
      queryClient.clear();
      window.location.assign("/login");
    } catch {
      endSignOut();
    }
  }, [beginSignOut, dialog, endSignOut, queryClient]);

  const onFieldChange = useCallback(<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) => {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  }, []);

  const onDiscard = useCallback(() => {
    setForm(baseline ?? { ...EMPTY_FORM, name: user?.name ?? "" });
    setAddressValid(true);
    save.reset();
  }, [baseline, save, user?.name]);

  const onSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!form?.name.trim() || save.isPending) return;
      save.mutate();
    },
    [form, save],
  );

  const saveError =
    save.error instanceof ApiError
      ? save.error.message
      : save.error
        ? "Couldn't save your profile. Try again."
        : null;
  const ready = form !== null;

  return (
    <AccountsPageView
      embedded={embedded}
      ready={ready}
      form={form}
      email={user?.email ?? profileQuery.data?.email ?? ""}
      emailVerified={profileQuery.data?.emailVerified}
      addressValid={addressValid}
      dirty={dirty}
      savePending={save.isPending}
      saveError={saveError}
      onSubmit={onSubmit}
      onFieldChange={onFieldChange}
      onDiscard={onDiscard}
      onAddressValidityChange={setAddressValid}
      onSignOut={onSignOut}
    />
  );
}

import { POLICY_DATA_REQUEST_HREF, type PolicyCta } from "./policy";

export type LegalLinkId = "privacy" | "cookies" | "voiceAi" | "rights" | "request";

export type LegalCtaCard = PolicyCta & {
  id: LegalLinkId;
  description: string;
};

export const PRIVACY_HUB_CTAS: LegalCtaCard[] = [
  {
    id: "cookies",
    href: "/policy/cookies",
    label: "Cookie Policy",
    description: "Session cookies, preferences, and how to control them.",
  },
  {
    id: "voiceAi",
    href: "/policy#voice-and-ai",
    label: "Voice & AI data",
    description: "How speaking audio and transcripts are processed.",
  },
  {
    id: "rights",
    href: "/policy#your-rights",
    label: "Your privacy rights",
    description: "Access, correct, export, or delete your data.",
  },
  {
    id: "request",
    href: POLICY_DATA_REQUEST_HREF,
    label: "Request your data",
    description: "Email support to export or delete your account.",
    external: true,
  },
];

export const COOKIE_HUB_CTAS: LegalCtaCard[] = [
  {
    id: "privacy",
    href: "/policy",
    label: "Privacy Policy",
    description: "What we collect across account, learning, voice, and billing.",
  },
  {
    id: "rights",
    href: "/policy#your-rights",
    label: "Your privacy rights",
    description: "Access, correct, export, or delete your data.",
  },
  {
    id: "request",
    href: POLICY_DATA_REQUEST_HREF,
    label: "Request your data",
    description: "Email support to export or delete your account.",
    external: true,
  },
];

export const FOOTER_PRIVACY_LINKS = [
  { id: "privacy", href: "/policy", label: "Privacy Policy" },
  { id: "cookies", href: "/policy/cookies", label: "Cookie Policy" },
  { id: "voiceAiShort", href: "/policy#voice-and-ai", label: "Voice & AI" },
  { id: "rightsShort", href: "/policy#your-rights", label: "Your rights" },
];

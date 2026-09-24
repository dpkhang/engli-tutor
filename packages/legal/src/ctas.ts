import { POLICY_DATA_REQUEST_HREF, type PolicyCta } from "./policy";

export type LegalCtaCard = PolicyCta & {
  description: string;
};

export const PRIVACY_HUB_CTAS: LegalCtaCard[] = [
  {
    href: "/policy/cookies",
    label: "Cookie Policy",
    description: "Session cookies, preferences, and how to control them.",
  },
  {
    href: "/policy#voice-and-ai",
    label: "Voice & AI data",
    description: "How speaking audio and transcripts are processed.",
  },
  {
    href: "/policy#your-rights",
    label: "Your privacy rights",
    description: "Access, correct, export, or delete your data.",
  },
  {
    href: POLICY_DATA_REQUEST_HREF,
    label: "Request your data",
    description: "Email support to export or delete your account.",
    external: true,
  },
];

export const COOKIE_HUB_CTAS: LegalCtaCard[] = [
  {
    href: "/policy",
    label: "Privacy Policy",
    description: "What we collect across account, learning, voice, and billing.",
  },
  {
    href: "/policy#your-rights",
    label: "Your privacy rights",
    description: "Access, correct, export, or delete your data.",
  },
  {
    href: POLICY_DATA_REQUEST_HREF,
    label: "Request your data",
    description: "Email support to export or delete your account.",
    external: true,
  },
];

export const FOOTER_PRIVACY_LINKS = [
  { href: "/policy", label: "Privacy Policy" },
  { href: "/policy/cookies", label: "Cookie Policy" },
  { href: "/policy#voice-and-ai", label: "Voice & AI" },
  { href: "/policy#your-rights", label: "Your rights" },
];

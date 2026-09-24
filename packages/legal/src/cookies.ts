import { POLICY_CONTACT_EMAIL, POLICY_DATA_REQUEST_HREF, type PolicySection } from "./policy";

export const COOKIE_POLICY_UPDATED_AT = "17 September 2026";

export const COOKIE_POLICY_SECTIONS: PolicySection[] = [
  {
    id: "what-cookies-are",
    title: "What cookies are",
    paragraphs: [
      "Cookies are small text files stored on your device. EngliTutor also uses browser storage (localStorage) for preferences that are not sent on every request.",
      "This page explains which cookies and storage we use, why, and how you can control them.",
    ],
    cta: { href: "/policy", label: "Read the Privacy Policy" },
  },
  {
    id: "necessary",
    title: "Strictly necessary cookies",
    paragraphs: [
      "These cookies keep you signed in and protect your session. The workspace cannot function without them.",
    ],
    bullets: [
      "Authentication session cookies (Better Auth). They identify your signed-in account across the marketing site and workspace.",
      "They are first-party, HTTP-only, and last for the session period set by the auth server.",
    ],
  },
  {
    id: "preferences",
    title: "Preference storage",
    paragraphs: [
      "These values stay on your device. They are not used to advertise to you.",
    ],
    bullets: [
      "Theme (light / dark) and accent colour.",
      "Text size and reduced-motion preference.",
      "Learning preferences such as speech rate and autoplay for listening.",
      "Local progress caches used to keep the workspace responsive.",
    ],
  },
  {
    id: "third-party",
    title: "Third-party cookies",
    paragraphs: [
      "Some features open another company’s checkout or sign-in page. Those companies may set their own cookies under their policies.",
    ],
    bullets: [
      "Stripe Checkout, when you pay for a plan or credit pack.",
      "Google or GitHub, only if you choose social sign-in.",
    ],
    cta: { href: "/policy#sharing", label: "See who we share data with" },
  },
  {
    id: "analytics",
    title: "Analytics and advertising",
    paragraphs: [
      "EngliTutor does not currently set advertising cookies or run a third-party analytics pixel.",
      "If that changes, we will update this page before those cookies are used.",
    ],
  },
  {
    id: "consent",
    title: "Cookie choices",
    paragraphs: [
      "The first time you visit EngliTutor, we ask you to accept cookies. You can choose Accept cookies (session + preferences) or Necessary only (sign-in cookies).",
      "You can change that choice later from Settings, or from this page with Manage cookies.",
    ],
  },
  {
    id: "control",
    title: "How to control cookies",
    paragraphs: [
      "You can sign out to end the session cookie. You can clear site data in your browser to remove preference storage.",
      "Blocking strictly necessary cookies will stop sign-in from working. Preference storage can be cleared without deleting your account.",
    ],
    cta: {
      href: POLICY_DATA_REQUEST_HREF,
      label: `Email ${POLICY_CONTACT_EMAIL}`,
      external: true,
    },
  },
];

export const POLICY_UPDATED_AT = "17 September 2026";
export const POLICY_CONTACT_EMAIL = "support@englitutor.ai";
export const POLICY_DATA_REQUEST_HREF = `mailto:${POLICY_CONTACT_EMAIL}?subject=${encodeURIComponent("EngliTutor data request")}`;

export type PolicyCta = {
  href: string;
  label: string;
  external?: boolean;
};

export type PolicySection = {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
  cta?: PolicyCta;
};

export const POLICY_SECTIONS: PolicySection[] = [
  {
    id: "who-we-are",
    title: "Who we are",
    paragraphs: [
      "EngliTutor is an AI English tutor for working professionals (A2–B1). We help you practise listening, speaking, reading, and writing, with feedback in Vietnamese.",
      "This policy explains what we collect, why we collect it, and the choices you have. It applies to the marketing site, workspace, checkout, and related services.",
    ],
  },
  {
    id: "what-we-collect",
    title: "What we collect",
    paragraphs: ["We collect only what we need to run the product:"],
    bullets: [
      "Account details: name, email, and a hashed password if you sign up with email.",
      "Sign-in with Google or GitHub: the name and email those providers share with us.",
      "Profile details you add in settings, such as job title, company, city, or learning goal.",
      "Learning data: lesson progress, exercise answers, speaking transcripts, tutor chat, and an error profile so the next session can review weak spots.",
      "Billing data: plan, subscription status, credits, and checkout references. Card numbers are handled by Stripe — we do not store full card details.",
      "Device data: session cookies, and preferences stored on your device (theme, text size, speech rate, motion).",
    ],
  },
  {
    id: "voice-and-ai",
    title: "Voice, transcripts, and AI",
    paragraphs: [
      "Speaking practice may send short audio clips to speech-to-text and text-to-speech providers so we can transcribe what you say and play tutor audio back.",
      "Transcripts and chat turns are used to generate feedback, score practice, and keep your session history. Your error profile (for example tense or pronunciation patterns) is used to pick what to review next.",
      "We do not sell your voice, transcripts, or tutor chats. We do not use them to advertise to you.",
    ],
    cta: { href: POLICY_DATA_REQUEST_HREF, label: "Ask us about your voice data", external: true },
  },
  {
    id: "how-we-use",
    title: "How we use your data",
    paragraphs: ["We use personal data to:"],
    bullets: [
      "Create and keep your account signed in.",
      "Deliver lessons, speaking sessions, and progress tracking.",
      "Personalise practice from your level, goals, and error profile.",
      "Process subscriptions, upgrades, and credit packs.",
      "Send service messages about billing, security, or product changes.",
      "Keep the service reliable, debug issues, and prevent abuse.",
    ],
  },
  {
    id: "legal-basis",
    title: "Why we are allowed to use it",
    paragraphs: [
      "We process account and learning data to provide the service you ask for — creating an account, practising, and keeping your progress.",
      "We process billing data to fulfil a paid plan or credit pack and to meet accounting rules.",
      "Where the law requires a separate legal basis (for example Vietnam’s personal data protection rules), we rely on your consent when you create an account, and on our legitimate interest in securing and improving the product.",
    ],
  },
  {
    id: "sharing",
    title: "Who we share data with",
    paragraphs: [
      "We share data with processors only to operate EngliTutor — not to sell it. Typical processors include:",
    ],
    bullets: [
      "Stripe, for checkout and subscription billing.",
      "OpenAI, for tutor replies, speech-to-text, text-to-speech, and related AI features.",
      "Cloudflare R2, for media such as images used in the product.",
      "Google or GitHub, only if you choose to sign in with those accounts.",
      "Our hosting providers (web and API) to run the service.",
    ],
  },
  {
    id: "transfers",
    title: "International transfers",
    paragraphs: [
      "Some processors may store or process data outside Vietnam, including in the United States or the European Union.",
      "We only send what is needed for the feature (for example a short audio clip for transcription, or an email address to create a Stripe customer).",
    ],
  },
  {
    id: "cookies",
    title: "Cookies and local storage",
    paragraphs: [
      "We use session cookies so you stay signed in. They are required for the workspace to work.",
      "The marketing and workspace apps also store appearance and learning preferences in your browser. You can clear these with your browser settings.",
    ],
    cta: { href: "/policy/cookies", label: "Read the Cookie Policy" },
  },
  {
    id: "security",
    title: "How we protect data",
    paragraphs: [
      "Passwords are stored hashed, not in plain text. Sessions use HTTP-only cookies.",
      "Access to production systems is limited to operators who need it. We use HTTPS in production.",
      "No method of transmission or storage is perfectly secure. If we learn of a breach that affects you, we will notify you and the relevant authority as required by law.",
    ],
  },
  {
    id: "retention",
    title: "How long we keep data",
    paragraphs: [
      "We keep account and learning records while your account is active so you can continue your path.",
      "Billing records may be kept for as long as needed for tax, accounting, or dispute handling.",
      "If you ask us to delete your account, we remove or anonymise personal data unless we must keep a copy for a legal obligation.",
    ],
    cta: { href: POLICY_DATA_REQUEST_HREF, label: "Request account deletion", external: true },
  },
  {
    id: "your-rights",
    title: "Your rights",
    paragraphs: [
      "Depending on where you live, including Vietnam’s personal data protection rules, you may ask us to:",
    ],
    bullets: [
      "Access the personal data we hold about you.",
      "Correct data that is wrong or incomplete.",
      "Delete your account and related personal data.",
      "Export a copy of your learning and account data.",
      "Restrict or object to certain processing, where the law allows.",
    ],
    cta: { href: POLICY_DATA_REQUEST_HREF, label: "Request your data", external: true },
  },
  {
    id: "marketing",
    title: "Messages we send",
    paragraphs: [
      "We send transactional email that the product needs: sign-in, billing receipts, and security notices.",
      "We do not sell your email list. If we add optional product news later, it will be opt-in and easy to turn off.",
    ],
  },
  {
    id: "children",
    title: "Children",
    paragraphs: [
      "EngliTutor is built for working adults. We do not knowingly collect personal data from children under 16. If you believe a child has created an account, contact us and we will delete it.",
    ],
  },
  {
    id: "changes",
    title: "Changes to this policy",
    paragraphs: [
      "We may update this page when the product or the law changes. The date at the top is the latest version. Continued use of EngliTutor after an update means you accept the revised policy.",
    ],
  },
];

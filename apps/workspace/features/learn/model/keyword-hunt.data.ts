import type { LearningGameRound as GameRound, LearningLevel as Level } from "../api/types";

type HuntDistractorType = "sound-alike" | "same-topic" | "form";

/**
 * Curated Keyword Hunt rounds.
 *
 * Semantics: `question.prompt` is the on-screen instruction; the sentence read aloud is
 * `question.transcript` (identical to `material.body`). Legacy fields `options` / `correctWords`
 * are derived from `targets` + `distractors`, so old clients keep working.
 *
 * NOTE: be/src/modules/learning/data/keyword-hunt.data.ts is a verbatim copy
 * (only the import line differs). Keep both in sync.
 */

/** [word, ipa, meaningVi, accept?] */
export type HuntTargetSpec = [word: string, ipa: string, meaningVi: string, accept?: string[]];
/** [word, type] */
export type HuntDistractorSpec = [word: string, type: HuntDistractorType];

export type HuntRoundSpec = {
  id: string;
  level: Level;
  topic: string;
  title: string;
  text: string;
  targets: HuntTargetSpec[];
  distractors: HuntDistractorSpec[];
  explanation: string;
  lessonIds?: string[];
};

function stableHash(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function buildHuntRound(spec: HuntRoundSpec): GameRound {
  const { id, level, topic, title, text, targets, distractors, explanation, lessonIds } = spec;
  const targetObjs = targets.map(([word, ipa, meaningVi, accept]) => ({
    word,
    ipa,
    meaningVi,
    ...(accept ? { accept } : {}),
  }));
  const distractorObjs = distractors.map(([word, type]) => ({ word, type }));
  const options = [...targetObjs.map((t) => t.word), ...distractorObjs.map((d) => d.word)].sort(
    (a, b) => stableHash(`${id}:${a}`) - stableHash(`${id}:${b}`),
  );
  return {
    id,
    level,
    seconds: 45,
    ...(lessonIds ? { lessonIds } : {}),
    hearAgainMax: level === "A2" ? 2 : 3,
    material: { title, speakable: true, body: text },
    question: {
      id: `${id}-q`,
      kind: "hunt",
      prompt: `Listen, then tap the ${targetObjs.length} words you actually heard.`,
      options,
      correctWords: targetObjs.map((t) => t.word),
      explanation,
      transcript: text,
      level,
      topic,
      targets: targetObjs,
      distractors: distractorObjs,
    },
  };
}

export const KEYWORD_HUNT_SPECS: HuntRoundSpec[] = [
  // ---------- A2 ----------
  {
    id: "kh-standup",
    level: "A2",
    topic: "work stand-up",
    title: "Stand-up — An speaking",
    text: "Yesterday I finished the login page and fixed one CSS bug on mobile. Today I will start the profile settings form and write two small tests. I have no blockers right now, but I may need the API document from Hung later.",
    targets: [
      ["yesterday", "/ˈjes.tə.deɪ/", "hôm qua"],
      ["login", "/ˈlɒɡ.ɪn/", "đăng nhập"],
      ["profile", "/ˈprəʊ.faɪl/", "hồ sơ cá nhân"],
      ["blockers", "/ˈblɒk.əz/", "vật cản, trở ngại"],
      ["document", "/ˈdɒk.jə.mənt/", "tài liệu"],
    ],
    distractors: [
      ["logout", "sound-alike"],
      ["profit", "sound-alike"],
      ["blocker", "form"],
      ["documents", "form"],
      ["sprint", "same-topic"],
      ["tomorrow", "same-topic"],
      ["ticket", "same-topic"],
    ],
    explanation: "Stand-ups follow yesterday → today → blockers. Listen for the work nouns, not look-alike words.",
    lessonIds: ["daily-standup"],
  },
  {
    id: "kh-tour",
    level: "A2",
    topic: "office tour",
    title: "Office tour",
    text: "The reception desk is on the ground floor. The product team sits on the third floor. Meeting Room B is opposite the kitchen. Ask security for a visitor badge before nine thirty.",
    targets: [
      ["reception", "/rɪˈsep.ʃən/", "quầy lễ tân"],
      ["third", "/θɜːd/", "thứ ba"],
      ["kitchen", "/ˈkɪtʃ.ɪn/", "nhà bếp"],
      ["badge", "/bædʒ/", "thẻ ra vào"],
      ["security", "/sɪˈkjʊə.rɪ.ti/", "bảo vệ, an ninh"],
    ],
    distractors: [
      ["receipt", "sound-alike"],
      ["thread", "sound-alike"],
      ["chicken", "sound-alike"],
      ["bridge", "sound-alike"],
      ["secure", "form"],
      ["lobby", "same-topic"],
      ["elevator", "same-topic"],
    ],
    explanation: "Places and one action from the welcome tour.",
  },
  {
    id: "kh-airport",
    level: "A2",
    topic: "travel",
    title: "At the airport",
    text: "Excuse me, where is the check-in desk? My flight to Hanoi leaves at six, and I have only one small suitcase.",
    targets: [
      ["desk", "/desk/", "quầy, bàn"],
      ["flight", "/flaɪt/", "chuyến bay"],
      ["leaves", "/liːvz/", "(máy bay) khởi hành", ["leave", "leaving"]],
      ["small", "/smɔːl/", "nhỏ"],
      ["suitcase", "/ˈsuːt.keɪs/", "va li"],
    ],
    distractors: [
      ["disk", "sound-alike"],
      ["light", "sound-alike"],
      ["leaf", "sound-alike"],
      ["passport", "same-topic"],
      ["boarding", "same-topic"],
      ["ticket", "same-topic"],
      ["luggage", "same-topic"],
    ],
    explanation: "Airport vocabulary: where to go, which flight, and what you carry.",
  },
  {
    id: "kh-cafe",
    level: "A2",
    topic: "food and drink",
    title: "Ordering at a café",
    text: "I would like a medium coffee and a chicken sandwich, please. Do you take cards, or only cash?",
    targets: [
      ["medium", "/ˈmiː.di.əm/", "cỡ vừa"],
      ["coffee", "/ˈkɒf.i/", "cà phê"],
      ["chicken", "/ˈtʃɪk.ɪn/", "thịt gà"],
      ["sandwich", "/ˈsæn.wɪdʒ/", "bánh mì kẹp"],
      ["cash", "/kæʃ/", "tiền mặt"],
    ],
    distractors: [
      ["cache", "sound-alike"],
      ["kitchen", "sound-alike"],
      ["sandwiches", "form"],
      ["menu", "same-topic"],
      ["tea", "same-topic"],
      ["cheese", "same-topic"],
      ["large", "same-topic"],
    ],
    explanation: "Order item, size, and payment method.",
  },
  // ---------- B1 ----------
  {
    id: "kh-meeting",
    level: "B1",
    topic: "meeting follow-up",
    title: "Voice message",
    text: "The client has moved our review to four thirty. Could you update the calendar invite and send the revised prototype before four? I will notify the engineering team. If anyone cannot stay, ask them to leave written comments in Figma.",
    targets: [
      ["review", "/rɪˈvjuː/", "buổi xem xét, đánh giá"],
      ["calendar", "/ˈkæl.ɪn.dər/", "lịch"],
      ["prototype", "/ˈprəʊ.tə.taɪp/", "bản mẫu"],
      ["engineering", "/ˌen.dʒɪˈnɪə.rɪŋ/", "kỹ thuật"],
      ["Figma", "/ˈfɪɡ.mə/", "Figma (công cụ thiết kế)"],
    ],
    distractors: [
      ["preview", "sound-alike"],
      ["protocol", "sound-alike"],
      ["figure", "sound-alike"],
      ["engineer", "form"],
      ["reviewed", "form"],
      ["schedule", "same-topic"],
      ["agenda", "same-topic"],
    ],
    explanation: "Catch the reason, the asks, and who owns engineering.",
    lessonIds: ["meeting-followup"],
  },
  {
    id: "kh-delay",
    level: "B1",
    topic: "work delay",
    title: "Delay call",
    text: "I'm stuck in traffic, so I'll be about twenty minutes late. Could you start without me and share the Figma link? If the client asks about the payment screen, tell them we will cover it later.",
    targets: [
      ["traffic", "/ˈtræf.ɪk/", "giao thông, tắc đường"],
      ["twenty", "/ˈtwen.ti/", "hai mươi"],
      ["Figma", "/ˈfɪɡ.mə/", "Figma (công cụ thiết kế)"],
      ["payment", "/ˈpeɪ.mənt/", "thanh toán"],
      ["cover", "/ˈkʌv.ər/", "đề cập, bao quát", ["covers"]],
    ],
    distractors: [
      ["thirty", "sound-alike"],
      ["twelve", "sound-alike"],
      ["figure", "sound-alike"],
      ["pay", "form"],
      ["covering", "form"],
      ["graphic", "same-topic"],
      ["delay", "same-topic"],
    ],
    explanation: "Reason, delay length, and the two asks.",
  },
  {
    id: "kh-clinic",
    level: "B1",
    topic: "health",
    title: "At the clinic",
    text: "I've had a sore throat and a mild fever since Monday. The doctor advised me to rest, drink plenty of water, and take the medicine twice a day.",
    targets: [
      ["throat", "/θrəʊt/", "cổ họng"],
      ["fever", "/ˈfiː.vər/", "cơn sốt"],
      ["advised", "/ədˈvaɪzd/", "khuyên", ["advise"]],
      ["plenty", "/ˈplen.ti/", "nhiều, dồi dào"],
      ["medicine", "/ˈmed.ɪ.sən/", "thuốc"],
    ],
    distractors: [
      ["threat", "sound-alike"],
      ["feather", "sound-alike"],
      ["advice", "form"],
      ["medical", "form"],
      ["headache", "same-topic"],
      ["cough", "same-topic"],
      ["pharmacy", "same-topic"],
    ],
    explanation: "Symptoms first, then the doctor's advice.",
  },
  {
    id: "kh-recycle",
    level: "B1",
    topic: "environment",
    title: "City recycling notice",
    text: "Our city is trying to reduce plastic waste. Residents must separate paper, glass, and plastic before the collection on Thursday.",
    targets: [
      ["reduce", "/rɪˈdjuːs/", "giảm"],
      ["plastic", "/ˈplæs.tɪk/", "nhựa"],
      ["waste", "/weɪst/", "rác thải"],
      ["glass", "/ɡlɑːs/", "thủy tinh"],
      ["collection", "/kəˈlek.ʃən/", "việc thu gom"],
    ],
    distractors: [
      ["produce", "sound-alike"],
      ["waist", "sound-alike"],
      ["class", "sound-alike"],
      ["collective", "form"],
      ["recycle", "same-topic"],
      ["garbage", "same-topic"],
      ["bin", "same-topic"],
    ],
    explanation: "Environmental notice: the goal, the materials, and the day.",
  },
  // ---------- TOEIC ----------
  {
    id: "kh-customer",
    level: "TOEIC",
    topic: "customer call",
    title: "Customer call",
    text: "We like the new landing page, but we need two changes before launch. Please replace the hero image and move the book club signup form higher. Can you send a preview by Monday at noon?",
    targets: [
      ["landing", "/ˈlæn.dɪŋ/", "(trang) đích"],
      ["hero", "/ˈhɪə.rəʊ/", "ảnh/banner chính"],
      ["signup", "/ˈsaɪn.ʌp/", "đăng ký"],
      ["preview", "/ˈpriː.vjuː/", "bản xem trước"],
      ["Monday", "/ˈmʌn.deɪ/", "thứ Hai"],
    ],
    distractors: [
      ["lending", "sound-alike"],
      ["zero", "sound-alike"],
      ["Sunday", "sound-alike"],
      ["review", "sound-alike"],
      ["signin", "form"],
      ["banner", "same-topic"],
      ["layout", "same-topic"],
    ],
    explanation: "The request is about the page, the form, and the deadline.",
    lessonIds: ["customer-call"],
  },
  {
    id: "kh-contract",
    level: "TOEIC",
    topic: "procurement email",
    title: "Supplier email",
    text: "Please review the attached contract and confirm the delivery date by Friday. If the supplier cannot deliver on time, we may need to cancel the order.",
    targets: [
      ["contract", "/ˈkɒn.trækt/", "hợp đồng"],
      ["confirm", "/kənˈfɜːm/", "xác nhận"],
      ["delivery", "/dɪˈlɪv.ər.i/", "việc giao hàng"],
      ["supplier", "/səˈplaɪ.ər/", "nhà cung cấp"],
      ["cancel", "/ˈkæn.səl/", "hủy"],
    ],
    distractors: [
      ["contrast", "sound-alike"],
      ["conform", "sound-alike"],
      ["delivered", "form"],
      ["supply", "form"],
      ["invoice", "same-topic"],
      ["shipment", "same-topic"],
      ["refund", "same-topic"],
    ],
    explanation: "A business email: document, action, party, and consequence.",
  },
  {
    id: "kh-conference",
    level: "TOEIC",
    topic: "events",
    title: "Conference announcement",
    text: "Registration for the annual conference opens next week. Attendees can choose between two workshops, and lunch will be provided on both days.",
    targets: [
      ["registration", "/ˌredʒ.ɪˈstreɪ.ʃən/", "việc đăng ký"],
      ["annual", "/ˈæn.ju.əl/", "hằng năm"],
      ["attendees", "/ˌæt.enˈdiːz/", "người tham dự"],
      ["workshops", "/ˈwɜːk.ʃɒps/", "buổi hội thảo thực hành"],
      ["lunch", "/lʌntʃ/", "bữa trưa"],
    ],
    distractors: [
      ["resignation", "sound-alike"],
      ["manual", "sound-alike"],
      ["launch", "sound-alike"],
      ["attendance", "form"],
      ["workshop", "form"],
      ["seminar", "same-topic"],
      ["agenda", "same-topic"],
    ],
    explanation: "Event notice: sign-up, who attends, what they choose, and what is included.",
  },
  // ---------- IELTS ----------
  {
    id: "kh-urban",
    level: "IELTS",
    topic: "urban transport",
    title: "Lecture extract — cities",
    text: "Many cities face serious congestion because public transport is unreliable. As a result, commuters increasingly depend on private cars.",
    targets: [
      ["congestion", "/kənˈdʒes.tʃən/", "sự tắc nghẽn"],
      ["public", "/ˈpʌb.lɪk/", "công cộng"],
      ["unreliable", "/ˌʌn.rɪˈlaɪ.ə.bəl/", "không đáng tin cậy"],
      ["commuters", "/kəˈmjuː.təz/", "người đi làm hằng ngày"],
      ["depend", "/dɪˈpend/", "phụ thuộc"],
    ],
    distractors: [
      ["suggestion", "sound-alike"],
      ["reliable", "form"],
      ["commuter", "form"],
      ["dependent", "form"],
      ["traffic", "same-topic"],
      ["pollution", "same-topic"],
      ["infrastructure", "same-topic"],
    ],
    explanation: "Cause (congestion, unreliable) and effect (depend on cars).",
  },
  {
    id: "kh-study",
    level: "IELTS",
    topic: "education",
    title: "Lecture extract — study habits",
    text: "Students who attend tutorials regularly tend to achieve higher grades. However, the research also suggests that independent study is essential.",
    targets: [
      ["tutorials", "/tjuːˈtɔː.ri.əlz/", "buổi học kèm nhóm nhỏ", ["tutorial"]],
      ["regularly", "/ˈreɡ.jə.lə.li/", "thường xuyên"],
      ["achieve", "/əˈtʃiːv/", "đạt được"],
      ["research", "/rɪˈsɜːtʃ/", "nghiên cứu"],
      ["independent", "/ˌɪn.dɪˈpen.dənt/", "độc lập"],
    ],
    distractors: [
      ["search", "sound-alike"],
      ["dependent", "sound-alike"],
      ["tutors", "form"],
      ["regular", "form"],
      ["achievement", "form"],
      ["lectures", "same-topic"],
      ["assignment", "same-topic"],
    ],
    explanation: "Academic claim, then a contrast signalled by 'However'.",
  },
  {
    id: "kh-climate",
    level: "IELTS",
    topic: "climate",
    title: "Lecture extract — climate policy",
    text: "Governments should invest in renewable energy to limit carbon emissions. Otherwise, rising temperatures could threaten agriculture worldwide.",
    targets: [
      ["invest", "/ɪnˈvest/", "đầu tư"],
      ["renewable", "/rɪˈnjuː.ə.bəl/", "có thể tái tạo"],
      ["carbon", "/ˈkɑː.bən/", "các-bon"],
      ["emissions", "/ɪˈmɪʃ.ənz/", "khí thải", ["emission"]],
      ["agriculture", "/ˈæɡ.rɪ.kʌl.tʃər/", "nông nghiệp"],
    ],
    distractors: [
      ["investigate", "sound-alike"],
      ["carton", "sound-alike"],
      ["missions", "sound-alike"],
      ["culture", "sound-alike"],
      ["renew", "form"],
      ["pollution", "same-topic"],
      ["fossil", "same-topic"],
    ],
    explanation: "Policy (invest in renewables) and the risk it addresses.",
  },
];

export const KEYWORD_HUNT_STATIC: GameRound[] = KEYWORD_HUNT_SPECS.map(buildHuntRound);

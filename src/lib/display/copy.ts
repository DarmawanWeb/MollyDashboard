/**
 * Everything the visitor display says, in Bahasa Indonesia and English.
 */

import type { ChatLanguage } from "@/types/ui";
import type { Story, StoryKind } from "./story";

export type DisplayLanguage = ChatLanguage;

type StoryText = (s: Story) => string;

const STORY_ID: Record<StoryKind, StoryText> = {
  offline: () => "Sedang beristirahat",
  idle: (s) => (s.place ? `Siap membantu di ${s.place}` : "Siap membantu"),
  walking: (s) =>
    s.target ? `Berjalan menuju ${s.target}` : "Sedang berjalan",
  guiding: (s) => (s.target ? `Memandu tur menuju ${s.target}` : "Memandu tur"),
  narrating: (s) => (s.place ? `Menjelaskan ${s.place}` : "Sedang bercerita"),
  visiting: (s) => (s.place ? `Berhenti di ${s.place}` : "Berhenti sejenak"),
  waiting: () => "Menunggu pengunjung",
  gesture: () => "Menyapa pengunjung",
  paused: () => "Tur dijeda sebentar",
  returning: (s) => (s.target ? `Kembali ke ${s.target}` : "Kembali ke awal"),
  blocked: () => "Menunggu jalan kosong",
  stopped: () => "Berhenti sejenak",
  mapping: () => "Memetakan area",
  remote: () => "Dipandu petugas",
};

const STORY_EN: Record<StoryKind, StoryText> = {
  offline: () => "Taking a break",
  idle: (s) => (s.place ? `Ready to help at ${s.place}` : "Ready to help"),
  walking: (s) => (s.target ? `Walking to ${s.target}` : "On the move"),
  guiding: (s) =>
    s.target ? `Guiding a tour to ${s.target}` : "Guiding a tour",
  narrating: (s) => (s.place ? `Explaining ${s.place}` : "Telling a story"),
  visiting: (s) => (s.place ? `Stopping at ${s.place}` : "Taking a short stop"),
  waiting: () => "Waiting for visitors",
  gesture: () => "Greeting visitors",
  paused: () => "Tour paused",
  returning: (s) => (s.target ? `Returning to ${s.target}` : "Heading back"),
  blocked: () => "Waiting for a clear path",
  stopped: () => "Holding still",
  mapping: () => "Mapping the area",
  remote: () => "Guided by staff",
};

const id = {
  tagline: "Robot Pemandu Berbasis AI",
  language: "Bahasa",
  theme: { light: "Ganti ke mode terang", dark: "Ganti ke mode gelap" },
  status: {
    live: "Online",
    demo: "Mode demo",
    offline: "Offline",
  },
  story: (s: Story) => STORY_ID[s.kind](s),
  camera: {
    title: "Pandangan Molly",
    live: "LANGSUNG",
    demo: "DEMO",
    offlineTitle: "Molly sedang beristirahat",
    offlineBody: "Molly akan kembali menyapa sebentar lagi.",
    demoTitle: "Kamera Molly",
    demoBody: "Video langsung tampil saat Molly terhubung.",
    failedTitle: "Kamera belum tersambung",
    retry: "Coba lagi",
  },
  speaking: "Molly berkata",
  stats: {
    visitors: "Pengunjung di sekitar",
    visitorsHint: "terlihat kamera Molly",
    questions: "Pertanyaan hari ini",
    questionsHint: "dijawab Molly",
    tours: "Tur hari ini",
    toursHint: "dipandu Molly",
    distance: "Jarak tempuh",
    distanceHint: "hari ini",
    battery: "Baterai",
    batteryHint: {
      full: "siap bertugas",
      low: "perlu diisi ulang",
      none: "belum terbaca",
    },
  },
  journey: {
    title: "Perjalanan Tur",
    exploreTitle: "Jelajahi bersama Molly",
    exploreBody: "Tempat-tempat menarik yang bisa Molly tunjukkan:",
    stopOf: (i: number, n: number) => `Pemberhentian ${i} dari ${n}`,
    running: "Berlangsung",
    paused: "Dijeda",
    ready: "Siap",
    done: "Selesai",
    now: "Sekarang",
    empty: "Belum ada tujuan tur.",
    restingTitle: "Molly sedang beristirahat",
    restingBody: "Tur akan dimulai lagi setelah Molly kembali.",
  },
  map: {
    title: "Lokasi Molly",
    near: (place: string) => `Di dekat ${place}`,
    molly: "Molly",
    stops: "Tujuan",
    visitors: "Pengunjung",
    noMap: "Peta tampil saat Molly terhubung",
  },
  chat: {
    title: "Tanya Molly",
    subtitle: "Molly menjawab dengan AI",
    placeholder: "Tulis pertanyaan untuk Molly…",
    send: "Kirim pertanyaan",
    speakOn: "Molly mengucapkan jawaban",
    speakOff: "Jawaban hanya di layar",
    history: "Riwayat",
    welcome:
      "Halo, aku Molly! Robot pemandu berkaki empat. Mau tahu apa hari ini? Ketik pertanyaanmu atau pilih salah satu di bawah.",
    suggestions: [
      "Siapa kamu, Molly?",
      "Apa saja yang bisa kulihat di sini?",
      "Bagaimana kamu bisa berjalan sendiri?",
      "Siapa yang membuatmu?",
    ],
    thinking: "Molly sedang berpikir",
    inPerson: "Ditanya langsung ke Molly",
    spoken: "Diucapkan",
    you: "Pengunjung",
    resting: "Molly sedang beristirahat. Coba tanya lagi nanti, ya.",
  },
  history: {
    title: "Riwayat Percakapan",
    search: "Cari pertanyaan atau jawaban…",
    today: "Hari ini",
    yesterday: "Kemarin",
    none: "Belum ada percakapan.",
    noMatch: "Tidak ada yang cocok.",
    count: (n: number) => `${n} percakapan`,
    close: "Tutup riwayat",
  },
  meet: {
    title: "Kenalan dengan Molly",
    facts: [
      { title: "Berkaki empat", body: "Lincah melewati lantai dan tanjakan." },
      { title: "Navigasi mandiri", body: "Menemukan jalan dengan peta LiDAR." },
      { title: "Ramah pengunjung", body: "Menyapa dan menunggu rombongan." },
      {
        title: "Bisa diajak ngobrol",
        body: "Menjawab dalam Indonesia & Inggris.",
      },
    ],
  },
  footer: {
    poweredBy: "Kolaborasi",
    operator: "Operator",
  },
  present: {
    start: "Presentasi",
    title: "Tampilkan layar penuh untuk TV, tanpa menu operator",
    exit: "Tahan untuk keluar dari mode presentasi",
    hint: "Mode presentasi · tekan Esc atau tahan tombol keluar di kanan atas",
  },
};

export type DisplayCopy = typeof id;

const en: DisplayCopy = {
  tagline: "AI Tour Guide Robot",
  language: "Language",
  theme: { light: "Switch to light mode", dark: "Switch to dark mode" },
  status: {
    live: "Online",
    demo: "Demo mode",
    offline: "Offline",
  },
  story: (s: Story) => STORY_EN[s.kind](s),
  camera: {
    title: "Molly's view",
    live: "LIVE",
    demo: "DEMO",
    offlineTitle: "Molly is taking a break",
    offlineBody: "She will be back to say hello soon.",
    demoTitle: "Molly's camera",
    demoBody: "Live video shows up when Molly is connected.",
    failedTitle: "Camera not connected yet",
    retry: "Try again",
  },
  speaking: "Molly says",
  stats: {
    visitors: "Visitors nearby",
    visitorsHint: "seen by Molly's camera",
    questions: "Questions today",
    questionsHint: "answered by Molly",
    tours: "Tours today",
    toursHint: "guided by Molly",
    distance: "Distance walked",
    distanceHint: "today",
    battery: "Battery",
    batteryHint: {
      full: "ready to go",
      low: "needs a charge",
      none: "not read yet",
    },
  },
  journey: {
    title: "Tour Journey",
    exploreTitle: "Explore with Molly",
    exploreBody: "Places Molly can show you:",
    stopOf: (i: number, n: number) => `Stop ${i} of ${n}`,
    running: "In progress",
    paused: "Paused",
    ready: "Ready",
    done: "Done",
    now: "Now",
    empty: "No tour stops yet.",
    restingTitle: "Molly is taking a break",
    restingBody: "Tours start again when Molly is back.",
  },
  map: {
    title: "Where is Molly",
    near: (place: string) => `Near ${place}`,
    molly: "Molly",
    stops: "Stops",
    visitors: "Visitors",
    noMap: "The map shows up when Molly is connected",
  },
  chat: {
    title: "Ask Molly",
    subtitle: "Molly answers with AI",
    placeholder: "Type a question for Molly…",
    send: "Send question",
    speakOn: "Molly says the answer",
    speakOff: "Answers on screen only",
    history: "History",
    welcome:
      "Hi, I'm Molly! A four-legged robot guide. What would you like to know? Type a question or pick one below.",
    suggestions: [
      "Who are you, Molly?",
      "What can I see here?",
      "How do you walk on your own?",
      "Who built you?",
    ],
    thinking: "Molly is thinking",
    inPerson: "Asked to Molly in person",
    spoken: "Spoken",
    you: "Visitor",
    resting: "Molly is taking a break. Please ask again later.",
  },
  history: {
    title: "Conversation History",
    search: "Search questions or answers…",
    today: "Today",
    yesterday: "Yesterday",
    none: "No conversations yet.",
    noMatch: "Nothing matches.",
    count: (n: number) => `${n} conversation${n === 1 ? "" : "s"}`,
    close: "Close history",
  },
  meet: {
    title: "Meet Molly",
    facts: [
      { title: "Four legs", body: "Nimble on floors and ramps." },
      { title: "Finds her way", body: "Navigates with a LiDAR map." },
      { title: "Visitor-friendly", body: "Greets and waits for the group." },
      { title: "Loves to chat", body: "Answers in Indonesian & English." },
    ],
  },
  footer: {
    poweredBy: "In partnership",
    operator: "Operator",
  },
  present: {
    start: "Present",
    title: "Full screen for the TV, without the operator menu",
    exit: "Hold to leave presentation mode",
    hint: "Presentation mode · press Esc or hold the exit button at the top right",
  },
};

export const DISPLAY_COPY: Record<DisplayLanguage, DisplayCopy> = { id, en };

/** Where a story's chip sits on the color scale. */
export type StoryTone = "go" | "talk" | "wait" | "rest" | "alert";

export function storyTone(kind: StoryKind): StoryTone {
  switch (kind) {
    case "guiding":
    case "walking":
    case "returning":
      return "go";
    case "narrating":
    case "gesture":
    case "visiting":
      return "talk";
    case "waiting":
    case "paused":
    case "mapping":
    case "remote":
      return "wait";
    case "blocked":
    case "stopped":
      return "alert";
    default:
      return "rest";
  }
}

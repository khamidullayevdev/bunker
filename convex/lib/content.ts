// Game content shared by the Convex backend and the Next.js client.
// All player-facing text is Uzbek (Latin script).

export type ScenarioId = "nuclear" | "zombie" | "alien" | "ai";
export type MoleVariant = "classic" | "zombie" | "alien" | "robot";

export type Scenario = {
  id: ScenarioId;
  name: string;
  title: string;
  story: string;
  quip: string;
  moleVariant: MoleVariant;
  duration: string;
  area: string;
  food: string;
  items: string[];
};

export const SCENARIOS: Record<ScenarioId, Scenario> = {
  nuclear: {
    id: "nuclear",
    name: "Yadroviy qish",
    title: "YADROVIY QISH",
    story:
      "Yer yuzini qalin kul qopladi. Quyosh koʻrinmaydi, tashqarida −40°C. Omon qolish uchun yagona joy — bunker.",
    quip: "Qoʻrqmanglar, bunkerda issiq choy bor. Faqat hammaga yetmaydi, oldindan aytib qoʻyay.",
    moleVariant: "classic",
    duration: "2 yil",
    area: "120 m²",
    food: "1 yil",
    items: ["Suv filtri", "Dori qutisi", "Radiostansiya"],
  },
  zombie: {
    id: "zombie",
    name: "Zombilar",
    title: "ZOMBI APOKALIPSISI",
    story:
      "Koʻchalarni tirik oʻliklar bosib ketdi. Virus tishlash orqali yuqadi, davosi hali topilmagan.",
    quip: "Meni biroz tishlashdi, lekin hali ham normalniy odamman. Nega orqaga ketyapsizlar?",
    moleVariant: "zombie",
    duration: "1 yil",
    area: "90 m²",
    food: "6 oy",
    items: ["Qurol ombori", "Antiseptik", "Ratsiya"],
  },
  alien: {
    id: "alien",
    name: "Oʻzga sayyoraliklar",
    title: "OʻZGA SAYYORALIKLAR",
    story:
      "Osmonda ulkan kemalar paydo boʻldi. Ular odamlarni birma-bir olib ketmoqda — sababi nomaʼlum.",
    quip: "Ular bilan gaplashdim. Qorni katta akalarni yoqtirisharkan, sizlarni unchalik emas.",
    moleVariant: "alien",
    duration: "3 yil",
    area: "150 m²",
    food: "2 yil",
    items: ["Teleskop", "Signal toʻsgich", "Konservalar"],
  },
  ai: {
    id: "ai",
    name: "Sunʼiy intellekt",
    title: "SUNʼIY INTELLEKT ISYONI",
    story:
      "Barcha tizimlarni sunʼiy intellekt egalladi. Telefonlar, mashinalar va robotlar endi odamlarga qarshi.",
    quip: "Telefoningizni oʻchiring. Ha, aynan sizga aytyapman. Siri ham eshitib turibdi.",
    moleVariant: "robot",
    duration: "5 yil",
    area: "200 m²",
    food: "3 yil",
    items: ["Analog radio", "Generator", "Qogʻoz xarita"],
  },
};

export const SCENARIO_IDS = Object.keys(SCENARIOS) as ScenarioId[];

export function isScenarioId(value: string): value is ScenarioId {
  return value in SCENARIOS;
}

export type CardCategory =
  | "kasb"
  | "biologiya"
  | "salomatlik"
  | "hobbi"
  | "fobiya"
  | "xarakter"
  | "bagaj"
  | "qoshimcha";

export const CARD_CATEGORIES: { id: CardCategory; label: string }[] = [
  { id: "kasb", label: "Kasb" },
  { id: "biologiya", label: "Biologiya" },
  { id: "salomatlik", label: "Salomatlik" },
  { id: "hobbi", label: "Hobbi" },
  { id: "fobiya", label: "Fobiya" },
  { id: "xarakter", label: "Xarakter" },
  { id: "bagaj", label: "Bagaj" },
  { id: "qoshimcha", label: "Qoʻshimcha" },
];

export const CATEGORY_LABEL: Record<CardCategory, string> = Object.fromEntries(
  CARD_CATEGORIES.map((c) => [c.id, c.label]),
) as Record<CardCategory, string>;

/** The card everyone must reveal in round 1. */
export const FIRST_ROUND_CATEGORY: CardCategory = "kasb";

export const HEALTHY = "Mutlaqo sogʻlom";

export const DECKS: Record<Exclude<CardCategory, "biologiya">, string[]> = {
  kasb: [
    "Jarroh", "Oʻqituvchi", "Oshpaz", "Dasturchi", "Harbiy", "Talaba", "Fermer",
    "Elektrik", "Santexnik", "Hamshira", "Psixolog", "Muhandis", "Haydovchi",
    "Quruvchi", "Kimyogar", "Biolog", "Veterinar", "Sartarosh", "Bloger",
    "Futbolchi", "Advokat", "Bankir", "Rassom", "Musiqachi", "Uchuvchi",
    "Politsiyachi", "Oʻt oʻchiruvchi", "Stomatolog", "Duradgor", "Tikuvchi",
    "Tarixchi", "Geolog", "Astronom", "Imom", "Tamada", "Taksist", "Sotuvchi",
    "Jurnalist", "Arxitektor", "Farmatsevt",
  ],
  salomatlik: [
    HEALTHY, HEALTHY, HEALTHY, "Yengil astma", "Diabet", "Allergiya (changga)",
    "Koʻzi yomon koʻradi", "Yuqori qon bosimi", "Uyqusizlik",
    "Bel ogʻrigʻi", "Oyogʻi sinib tuzalgan", "Migren", "Qandli diabet (yengil)",
    "Homilador (3 oy)", "Kar (bir quloq)", "Ortiqcha vazn", "Juda baquvvat",
    "Sogʻlom, lekin xurrak otadi", "Gripp (yuqumli)", "Tish ogʻrigʻi",
  ],
  hobbi: [
    "Baliq ovlash", "Gitara chalish", "Shaxmat", "Pazandachilik", "Boks",
    "Ov qilish", "Bogʻdorchilik", "Kitob oʻqish", "Raqs", "Futbol",
    "Kompyuter oʻyinlari", "Yoga", "Toqqa chiqish", "Tikish-bichish",
    "Hazil-mutoyiba", "Rasm chizish", "Karaoke", "Duradgorlik", "Velosiped",
    "Sehrgarlik nayranglari", "Asalarichilik", "Suzish",
  ],
  fobiya: [
    "Qorongʻulikdan qoʻrqadi", "Ilondan qoʻrqadi", "Yopiq joydan qoʻrqadi",
    "Baland joydan qoʻrqadi", "Itdan qoʻrqadi", "Qondan qoʻrqadi",
    "Yolgʻizlikdan qoʻrqadi", "Suvdan qoʻrqadi", "Hasharotdan qoʻrqadi",
    "Olomondan qoʻrqadi", "Shifokordan qoʻrqadi", "Qaynonadan qoʻrqadi",
    "Mikroblardan qoʻrqadi", "Oʻrgimchakdan qoʻrqadi", "Hech narsadan qoʻrqmaydi",
  ],
  xarakter: [
    "Sabrli, sovuqqon", "Hazilkash", "Jahldor", "Lider", "Dangasa",
    "Mehnatkash", "Ayyor", "Rostgoʻy", "Qaysar", "Xushmuomala", "Vahimachi",
    "Gʻamxoʻr", "Maqtanchoq", "Jim-jit", "Optimist", "Pessimist", "Ochkoʻz",
    "Saxiy",
  ],
  bagaj: [
    "Benzinli generator", "Dori qutisi", "Gitara", "Oshxona pichoqlari", "Ov miltigʻi",
    "Urugʻlar toʻplami", "Quyosh paneli", "Ratsiya", "Bir qop guruch", "Asboblar qutisi",
    "Uxlash xaltasi", "Fonar va batareyalar", "Kitoblar sandigʻi", "Qozon va oʻchoq",
    "Shaxmat taxtasi", "Chodir", "Suv filtri", "Tibbiy maska (100 ta)", "Mushuk",
    "Baliqlar akvariumi", "Noutbuk (internetsiz)", "Arqon (50 m)",
  ],
  qoshimcha: [
    "Elektrikni biladi", "Uch tilni biladi", "Birinchi yordam koʻrsata oladi",
    "Ovqatni tez pishiradi", "Mashina taʼmirlay oladi", "Yaxshi qoʻshiq aytadi",
    "Bolalarni yaxshi koʻradi", "Uyquda gapiradi", "Oldin qamoqda oʻtirgan",
    "Millioner (lekin pul endi kerakmas)", "Sport ustasi", "Hech qachon yolgʻon gapirmaydi",
    "Juda koʻp ovqat yeydi", "Yer qazishni biladi", "Dengiz flotida xizmat qilgan",
    "Oʻzini tibbiyotchi deb biladi", "Tunda koʻradi", "Ertak aytib beradi",
  ],
};

export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 12;

/** How many spots the bunker has for a given number of players. */
export function bunkerCapacity(playerCount: number): number {
  return Math.max(1, Math.floor(playerCount / 2));
}

// Qilichbek comments on every knockout.
const PUNCHLINES = [
  "Kulachkada nakaut qildim, lox!",
  "{name}, bir jab, bir xuk, va sen tashqaridasan. Trenerim faxrlanardi.",
  "{name}ni sanab chiqdim: bir, ikki... oʻn. Turmadi!",
  "{name}, xafa boʻlma. Men ham chempion boʻlolmaganman, mana, bunkerda ishlayapman.",
  "{name}, ring ham, bunker ham seniki emas ekan. Perchatkangni qoldirib ket.",
  "2009-yilda men ham shunaqa yiqilganman, {name}. Hali ham alam qiladi.",
];

const TIE_PUNCHLINE = "Ovozlar teng chiqdi, sudya tanga tashladi. {name}, omading kelmadi, lox!";

export function eliminationIntro(cards: { category: string; value: string; age?: number; sex?: string }[]): string {
  const bio = cards.find((c) => c.category === "biologiya");
  const health = cards.find((c) => c.category === "salomatlik");
  const job = cards.find((c) => c.category === "kasb");
  const healthy = health?.value === HEALTHY;
  const who =
    bio?.age && bio.sex
      ? `${bio.age} yoshli ${healthy ? "sogʻlom " : ""}${bio.sex.toLowerCase()}`
      : "yaxshi odam";
  return `U ${who} edi${job ? `, kasbi — ${job.value.toLowerCase()}` : ""}...`;
}

export function eliminationPunchline(name: string, seed: string, tie: boolean): string {
  return tie ? TIE_PUNCHLINE.replaceAll("{name}", name) : pickLine(PUNCHLINES, seed, name);
}

/**
 * Special cards: every player gets one secret card per game and plays it once.
 * Vote cards work during voting; swap cards work in discussion or voting.
 * Playing a card is public: everyone sees who used what.
 */
export const SPECIAL_IDS = [
  "bekor",
  "ikki",
  "qalqon",
  "almash_bagaj",
  "almash_salomatlik",
  "almash_istalgan",
  "ogirlik",
  "sirli",
] as const;
export type SpecialId = (typeof SPECIAL_IDS)[number];

type Phase = "discussion" | "voting";

export type SpecialCardInfo = {
  title: string;
  short: string;
  what: string;
  when: string;
  tip: string;
  /** Phases in which the card can be played. */
  phases: Phase[];
  /** Swap cards that always work on one category. */
  category?: CardCategory;
};

const VOTE_ONLY: Phase[] = ["voting"];
const ANY_TIME: Phase[] = ["discussion", "voting"];
const ONCE = "Butun oʻyinda faqat bir marta.";

export const SPECIAL_CARDS: Record<SpecialId, SpecialCardInfo> = {
  bekor: {
    title: "Ovozni bekor qilish",
    short: "Sizga qarshi berilgan bitta ovoz hisoblanmaydi.",
    what: "Sizga ovoz berganlardan bittasini tanlaysiz. Uning sizga bergan ovozi shu raundda sanalmaydi.",
    when: `Ovoz berish paytida, kimdir sizga ovoz bergandan keyin, lobby egasi “Yakunlash”ni bosguncha. ${ONCE}`,
    tip: "Eng ashaddiy dushmaningiz ovoz bersa, aynan uniki kuyib ketsin.",
    phases: VOTE_ONLY,
  },
  ikki: {
    title: "Ikki barobar ovoz",
    short: "Ovozingiz ikkitaga oʻtadi.",
    what: "Bitta oʻyinchini tanlaysiz va unga qoʻshimcha 2 ta ovoz yoziladi. Oddiy ovozingiz ham oʻz kuchida qoladi.",
    when: `Ovoz berish paytida, lobby egasi “Yakunlash”ni bosguncha. ${ONCE}`,
    tip: "Hamma ikkilanib turganda ishlating, kim ketishini siz hal qilasiz.",
    phases: VOTE_ONLY,
  },
  qalqon: {
    title: "Qalqon",
    short: "Shu raundda sizni bunkerdan chiqarib boʻlmaydi.",
    what: "Shu raundda sizga qarshi berilgan barcha ovozlar sanalmaydi. Chiqib ketish navbati eng koʻp ovoz olgan boshqa odamga oʻtadi.",
    when: `Ovoz berish paytida, lobby egasi “Yakunlash”ni bosguncha. ${ONCE}`,
    tip: "Hamma sizga qarab turgan boʻlsa, qalqonni koʻtaring. Faqat keyingi raundda himoya yoʻq, eslab qoling.",
    phases: VOTE_ONLY,
  },
  almash_bagaj: {
    title: "Bagaj almashuvi",
    short: "Ikki oʻyinchining ochilgan bagajini almashtirasiz.",
    what: "Bagaji ochilgan ikki oʻyinchini tanlaysiz, oʻzingiz ham boʻlishingiz mumkin. Bagajlari joy almashadi va hamma buni koʻradi.",
    when: `Muhokama yoki ovoz berish paytida, kamida ikki kishining bagaji ochilgan boʻlsa. ${ONCE}`,
    tip: "Kimdadir generator bor, sizda esa mushuk? Vaqti keldi.",
    phases: ANY_TIME,
    category: "bagaj",
  },
  almash_salomatlik: {
    title: "Salomatlik almashuvi",
    short: "Ikki oʻyinchining ochilgan salomatligini almashtirasiz.",
    what: "Salomatligi ochilgan ikki oʻyinchini tanlaysiz, oʻzingiz ham boʻlishingiz mumkin. Ularning salomatlik kartalari joy almashadi.",
    when: `Muhokama yoki ovoz berish paytida, kamida ikki kishining salomatligi ochilgan boʻlsa. ${ONCE}`,
    tip: "Diabetingizni “Mutlaqo sogʻlom” odamga berib yuboring. Hech kim sezmaydi. Hamma sezadi.",
    phases: ANY_TIME,
    category: "salomatlik",
  },
  almash_istalgan: {
    title: "Istalgan karta almashuvi",
    short: "Ikki oʻyinchining bir turdagi ochiq kartasini almashtirasiz.",
    what: "Avval karta turini tanlaysiz (kasb, hobbi, fobiya va hokazo), keyin shu kartasi ochilgan ikki oʻyinchini. Kartalar joy almashadi va hamma koʻradi.",
    when: `Muhokama yoki ovoz berish paytida, kamida ikki kishining shu kartasi ochilgan boʻlsa. ${ONCE}`,
    tip: "Kasbingiz “bloger”mi? Jarrohga almashtirib oling, keyin tushuntirasiz.",
    phases: ANY_TIME,
  },
  ogirlik: {
    title: "Yashirin almashuv",
    short: "Boshqa oʻyinchining yopiq kartasini oʻzingiznikiga almashtirasiz.",
    what: "Oʻyinchi va karta turini tanlaysiz. Ikkalangizda ham shu karta hali yopiq boʻlsa, ular almashadi. Nima tushganini faqat siz va u koʻrasiz.",
    when: `Muhokama yoki ovoz berish paytida. ${ONCE}`,
    tip: "Yopiq kartangiz yomonmi? Birovniki bilan almashib koʻring. Tavakkal qilmagan shampan ichmaydi.",
    phases: ANY_TIME,
  },
  sirli: {
    title: "Sirli karta",
    short: "Tasodifiy karta tortib, bir oʻyinchining kartasini almashtirasiz.",
    what: "Tugmani bosasiz va oʻyindagi kartalardan biri tasodifan tortiladi. U hammaga, hatto sizga ham “?” boʻlib qoladi. Keyin oʻyinchini tanlaysiz: uning shu turdagi kartasi yangisiga almashadi. Masalan, “70 yoshli ayol” → “19 yoshli erkak”.",
    when: `Muhokama yoki ovoz berish paytida. ${ONCE}`,
    tip: "Bu lotereya. Raqibingizga bersangiz, unga omad kulib boqishi ham mumkin. Keyin menga yigʻlab kelmang.",
    phases: ANY_TIME,
  },
};

export function isSpecialId(value: string): value is SpecialId {
  return value in SPECIAL_CARDS;
}

export function isCardCategory(value: string): value is CardCategory {
  return value in CATEGORY_LABEL;
}

/**
 * Threats (tahdidlar): from round 2 on, every other round the bunker breaks
 * somewhere. Each threat names the cards that can fix it, so revealing the
 * right card, or swapping it in with a special card, actually matters.
 */
export type Threat = {
  id: string;
  /** Small heading under the card, like "BUNKER TIZIMIDAGI NOSOZLIK". */
  kind: string;
  text: string;
  /** Exact card values (any category) that can deal with it. */
  solvers: string[];
};

export const THREATS: Threat[] = [
  {
    id: "kislorod",
    kind: "BUNKER TIZIMIDAGI NOSOZLIK",
    text: "Kompyuter xatolik koʻrsatmoqda — kislorod, bosim va harorat meʼyordan oshgan. Tashqaridan hammasi joyida, ammo qoʻlda tekshiruv uchun tajribali mutaxassis kerak.",
    solvers: ["Muhandis", "Elektrik", "Dasturchi", "Kimyogar", "Elektrikni biladi", "Asboblar qutisi"],
  },
  {
    id: "elektr",
    kind: "ELEKTR TAʼMINOTI UZILDI",
    text: "Asosiy shit kuyib ketdi. Chiroqlar oʻchdi, ventilyatsiya toʻxtadi. Bir sutka ichida zaxira quvvat ulanmasa, havo yetmay qoladi.",
    solvers: ["Elektrik", "Muhandis", "Elektrikni biladi", "Benzinli generator", "Quyosh paneli", "Fonar va batareyalar"],
  },
  {
    id: "suv",
    kind: "SUV QUVURI YORILDI",
    text: "Pastki qavatni suv bosmoqda, ichimlik suvi zaxirasi ifloslanyapti. Quvurni yopmasak, bir haftada suvsiz qolamiz.",
    solvers: ["Santexnik", "Quruvchi", "Muhandis", "Suv filtri", "Asboblar qutisi", "Suzish"],
  },
  {
    id: "kasallik",
    kind: "YUQUMLI KASALLIK",
    text: "Bunkerda kimdir isitmalab, qattiq yoʻtala boshladi. Kasallik hammaga tarqalmasidan davolash va ajratib qoʻyish kerak.",
    solvers: ["Jarroh", "Hamshira", "Farmatsevt", "Biolog", "Dori qutisi", "Tibbiy maska (100 ta)", "Birinchi yordam koʻrsata oladi"],
  },
  {
    id: "jarohat",
    kind: "OGʻIR JAROHAT",
    text: "Eshikni yopayotganda bir kishining qoʻli qisilib, suyagi sindi. Qon toʻxtamayapti, hamma vahimada.",
    solvers: ["Jarroh", "Hamshira", "Veterinar", "Stomatolog", "Dori qutisi", "Birinchi yordam koʻrsata oladi"],
  },
  {
    id: "ovqat",
    kind: "OZIQ-OVQAT BUZILDI",
    text: "Omborxonadagi konservalarning yarmi shishib ketdi. Ovqat zaxirasi ikki baravar qisqardi, yangi manba topish kerak.",
    solvers: ["Oshpaz", "Fermer", "Biolog", "Urugʻlar toʻplami", "Bir qop guruch", "Baliq ovlash", "Ov qilish", "Bogʻdorchilik", "Ov miltigʻi"],
  },
  {
    id: "aloqa",
    kind: "ALOQA YOʻQOLDI",
    text: "Tashqi dunyo bilan aloqa butunlay uzildi. Qutqaruvchilar bizni qayerdaligimizni bilishmaydi, signal yuborish kerak.",
    solvers: ["Dasturchi", "Harbiy", "Muhandis", "Uchuvchi", "Ratsiya", "Dengiz flotida xizmat qilgan"],
  },
  {
    id: "bosqin",
    kind: "TASHQI BOSQIN",
    text: "Kechasi kimdir bunker eshigini buzishga urindi. Ertaga yana kelishadi, bu safar koʻpchilik boʻlib.",
    solvers: ["Harbiy", "Politsiyachi", "Ov miltigʻi", "Boks", "Ov qilish", "Sport ustasi", "Oldin qamoqda oʻtirgan"],
  },
  {
    id: "yongin",
    kind: "YONGʻIN",
    text: "Oshxonada qisqa tutashuvdan yongʻin chiqdi. Tutun ventilyatsiyaga ketmoqda, oʻchirmasak hamma boʻgʻilib qoladi.",
    solvers: ["Oʻt oʻchiruvchi", "Elektrik", "Kimyogar", "Elektrikni biladi", "Tibbiy maska (100 ta)"],
  },
  {
    id: "ruhiy",
    kind: "RUHIY TUSHKUNLIK",
    text: "Odamlar uxlay olmayapti, janjal koʻpaydi. Yana bir hafta shunday davom etsa, bir-birimizni yeb qoʻyamiz.",
    solvers: ["Psixolog", "Imom", "Tamada", "Musiqachi", "Gitara", "Hazilkash", "Hazil-mutoyiba", "Ertak aytib beradi", "Shaxmat taxtasi"],
  },
  {
    id: "devor",
    kind: "DEVOR YORILDI",
    text: "Zilziladan keyin bunker devorida katta yoriq paydo boʻldi, shiftdan tuproq toʻkilyapti.",
    solvers: ["Quruvchi", "Arxitektor", "Muhandis", "Duradgor", "Geolog", "Asboblar qutisi", "Yer qazishni biladi", "Duradgorlik"],
  },
];

export const THREAT_BY_ID: Record<string, Threat> = Object.fromEntries(THREATS.map((t) => [t.id, t]));

/** Rounds that open with a new threat: right after the first round, then every other round. */
export function roundHasThreat(round: number): boolean {
  return round >= 2 && round % 2 === 0;
}

/**
 * Picks the next threat from what the people still inside actually hold, so it
 * is never pure luck: a threat someone can fix, and the rarer the fix the
 * better (that card becomes precious). Ties go in the fixed list order.
 */
export function pickThreat(aliveCards: { value: string }[][], seen: string[]): Threat {
  const fresh = THREATS.filter((t) => !seen.includes(t.id));
  const pool = fresh.length > 0 ? fresh : THREATS;
  const holders = (t: Threat) => aliveCards.filter((cards) => cards.some((c) => t.solvers.includes(c.value))).length;
  const scored = pool.map((t) => ({ t, n: holders(t) }));
  const solvable = scored.filter((s) => s.n > 0);
  const best = (solvable.length > 0 ? solvable : scored).reduce((a, b) => (b.n < a.n ? b : a));
  return best.t;
}

// Qilichbek's lines. {name} is replaced with a player's name.
export const SPEAKER_LINES = [
  "Atak mejikka 42 avtobus boradi, pitakinda uhla bugun.",
  "{name} siyib keb uhla...",
  "Uh bla najdanka bilan nakaunt boʻldiyu.",
  "{name} siqilma ukam, hali bundan battar ***ni yisan.",
  "Charchasang bu dunyo gʻamidan, nega tugʻulding? Charchamade ukam.",
  "{name} gapir, gapir, gapir, gapir.",
];

export const VOTER_LINES = [
  "{name} ovoz bervotti. Yo voqtimmi olasan, yo pulimmi olasan.",
  "{name} tezlash ukam, yandexim kutvotti.",
  "{name} ovoz beryapti. Oʻtakan boʻtakan, mazgi qigan koʻtakan.",
  "{name} oka, beshminga mayda bom, kulma yiban ovoz ber.",
  "{name} ovoz bervottilayuuuuu, dadosh.",
  "{name} gapir, gapir, gapir, gapir.",
];

export const PARTY_LINES = [
  "Bugun bayram oqshomgacha boʻladi, jurala!",
  "{name} kolaga chiqib ke ukam, nishonla voriluuuu buni!",
  "{name} aragʻdan quy, aragʻdan!",
  "J'ai cru en vous les gars, on va s'en sortir, c'est sûr.",
  "Tanishlarim bor, chaqiraman. Arzon boʻsayam yommmonidan.",
];

/** A stable pick from a list, so every phone shows the same line. */
export function pickLine(lines: string[], seed: string, name = ""): string {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return lines[Math.abs(h) % lines.length].replaceAll("{name}", name);
}

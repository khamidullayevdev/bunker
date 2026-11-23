import { BackLink, MoleSay, PrimaryButton, Screen, Title } from "@/components/ui";

// Shown only after the sign-in check in the root layout, which runs in the browser.
export const instant = false;

const STEPS = [
  {
    title: "Halokat yuz beradi",
    text: "Har oʻyinda lobby egasi ssenariy tanlaydi: yadroviy qish, zombilar, oʻzga sayyoraliklar yoki sunʼiy intellekt.",
  },
  {
    title: "Kartalaringizni koʻring",
    text: "Sizda 8 ta yashirin karta bor: kasb, yosh, salomatlik, hobbi, fobiya, xarakter, bagaj va qoʻshimcha maʼlumot. Yana bitta maxsus karta: uni ovoz berishda bir marta ishlatsangiz boʻladi.",
  },
  {
    title: "Har raundda bitta karta oching",
    text: "Birinchi raundda hamma kasbini ochadi va tanishadi, bu raundda hech kim chiqarilmaydi. Keyin navbat bilan nega aynan siz bunkerga kerakligingizni isbotlang.",
  },
  {
    title: "Tahdidlarga tayyor turing",
    text: "2-raunddan boshlab har ikki raundda bunkerda nosozlik yoki xavf chiqadi. Kimning kartasi uni hal qila olsa, u bunkerga kerakroq. Kerakli kartani maxsus karta bilan oʻzingizga olsangiz ham boʻladi.",
  },
  {
    title: "Ochiq ovoz bering",
    text: "2-raunddan boshlab har raundda bir kishi chiqadi. Navbat bilan, hamma koʻrib turgan holda ovoz beriladi. Oʻzingizni oqlashga ulgursangiz, ovozlar oʻzgarishi mumkin!",
  },
  {
    title: "Bunker yopiladi",
    text: "Joylar soniga qadar odam qolganda oʻyin tugaydi. Natijalaringiz profilingizda saqlanadi.",
  },
];

export default function RulesPage() {
  return (
    <Screen>
      <div className="flex items-center gap-3">
        <BackLink />
        <Title>QANDAY OʻYNALADI</Title>
      </div>
      <MoleSay mood="guide" size={110}>
        Qoidalar juda oddiy! Men har qadamda yoningizda boʻlaman.
      </MoleSay>
      <ol className="flex flex-col gap-2.5">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex items-start gap-3.5 rounded-2xl border-2 border-line bg-surface p-3.5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-btn font-stencil text-[20px] text-btn-ink">
              {i + 1}
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-[17px] font-black">{step.title}</span>
              <span className="text-[14px] font-semibold leading-snug text-muted">{step.text}</span>
            </span>
          </li>
        ))}
      </ol>
      <div className="flex-1" />
      <PrimaryButton href="/" vine="right">
        Tushunarli, boshladik!
      </PrimaryButton>
    </Screen>
  );
}

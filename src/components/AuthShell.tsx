import type { ReactNode } from "react";
import Hatch from "./Hatch";
import Mole from "./Mole";
import Vine from "./Vine";

/** Same frame as the home screen in the canvas: logo, hatch with Qilichbek, speech bubble, then the form. */
export default function AuthShell({ children, line }: { children: ReactNode; line: string }) {
  return (
    <div className="bunker-bg flex min-h-full flex-1 flex-col gap-3 px-5 pt-5 pb-6 text-ink">
      <header className="flex items-center">
        <span className="font-stencil text-[26px] tracking-wide">
          BUNKER<span className="text-accent">*</span>CHA
        </span>
      </header>

      <div className="relative mx-auto h-[220px] w-[260px]">
        <div className="absolute left-[40px] top-0">
          <Hatch size={180} />
        </div>
        <Vine kind="corner" width={100} height={100} className="absolute left-[16px] -top-[6px]" />
        <div className="absolute left-[64px] top-[78px]">
          <Mole mood="wave" size={140} className="mole-bob" />
        </div>
      </div>

      <p className="relative rounded-[18px] bg-paper px-4 py-3 text-[15px] font-bold leading-snug text-paper-ink">
        <span aria-hidden="true" className="absolute -top-2 left-1/2 size-4 -translate-x-1/2 rotate-45 bg-paper" />
        {line}
      </p>

      <div className="relative">
        {children}
        <Vine kind="drape" width={200} height={44} className="pointer-events-none absolute -top-1.5 right-3" />
      </div>
    </div>
  );
}

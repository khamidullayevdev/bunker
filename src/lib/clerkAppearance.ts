/**
 * Bunker look for Clerk's sign-in / sign-up widgets: the nuclear palette,
 * Nunito, chunky gold buttons and dark inset inputs, matching the canvas.
 */
export const bunkerAppearance = {
  variables: {
    colorPrimary: "#b8964a",
    colorPrimaryForeground: "#1c2213",
    colorBackground: "#323d25",
    colorForeground: "#ebebd8",
    colorMuted: "#28301c",
    colorMutedForeground: "#c5cbb0",
    colorInput: "#28301c",
    colorInputForeground: "#ebebd8",
    colorBorder: "#455230",
    colorRing: "#dab716",
    colorDanger: "#fa3518",
    colorSuccess: "#9ba685",
    colorNeutral: "#ebebd8",
    colorShadow: "transparent",
    fontFamily: "var(--font-nunito), system-ui, sans-serif",
    borderRadius: "12px",
  },
  elements: {
    rootBox: "w-full!",
    cardBox: "w-full! max-w-none! rounded-[18px]! border-2! border-line! shadow-none!",
    card: "bg-surface! shadow-none! px-4! py-5! gap-5!",
    header: "gap-1!",
    headerTitle: "font-stencil! text-[22px]! font-normal! tracking-wide! text-ink!",
    headerSubtitle: "text-[14px]! font-bold! text-muted!",
    socialButtonsBlockButton:
      "h-12! rounded-xl! border-2! border-sage! bg-paper! text-paper-ink! shadow-[0_3px_0_var(--stem)]! hover:bg-paper!",
    socialButtonsBlockButtonText: "text-[15px]! font-black! text-paper-ink!",
    dividerLine: "bg-line!",
    dividerText: "text-[13px]! font-extrabold! text-muted!",
    formFieldLabel: "text-[13px]! font-extrabold! text-muted!",
    formFieldInput:
      "h-12! rounded-xl! border-2! border-line! bg-bg! px-3! text-[16px]! font-bold! text-ink! shadow-none! focus:border-accent!",
    formFieldAction: "font-extrabold! text-accent!",
    // Same as the in-game gold buttons ("Yana oʻynash", "Keyingi raund").
    formButtonPrimary:
      "h-14! rounded-2xl! border-0! bg-btn! bg-none! px-4! text-[18px]! font-black! normal-case! tracking-normal! text-btn-ink! shadow-[0_4px_0_var(--btn-shadow)]! hover:bg-btn! active:translate-y-[3px]! active:shadow-[0_1px_0_var(--btn-shadow)]!",
    buttonArrowIcon: "hidden!",
    otpCodeFieldInput: "border-2! border-line! bg-bg! text-ink! font-black!",
    identityPreview: "rounded-xl! border-2! border-line! bg-bg!",
    identityPreviewText: "font-bold! text-ink!",
    identityPreviewEditButton: "text-accent!",
    formResendCodeLink: "font-extrabold! text-accent!",
    alternativeMethodsBlockButton: "rounded-xl! border-2! border-sage! text-ink! font-black!",
    backLink: "font-extrabold! text-accent!",
    footer: "bg-none! bg-transparent!",
    footerAction: "bg-transparent!",
    footerActionText: "text-[14px]! font-bold! text-muted!",
    footerActionLink: "text-[14px]! font-black! text-accent! hover:text-accent!",
    alert: "rounded-xl!",
  },
} as const;

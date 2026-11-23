import type { ComponentProps } from "react";
import type { ClerkProvider } from "@clerk/nextjs";

type LocalizationResource = NonNullable<ComponentProps<typeof ClerkProvider>["localization"]>;

/** Uzbek (Latin) texts for the Clerk sign-in and sign-up screens. Clerk ships no Uzbek pack. */
export const uzLocalization: LocalizationResource = {
  locale: "uz-UZ",
  socialButtonsBlockButton: "{{provider|titleize}} orqali davom etish",
  dividerText: "yoki",
  formFieldLabel__emailAddress: "Email manzil",
  formFieldLabel__emailAddress_username: "Email yoki foydalanuvchi nomi",
  formFieldLabel__username: "Foydalanuvchi nomi",
  formFieldLabel__password: "Parol",
  formFieldLabel__firstName: "Ism",
  formFieldLabel__lastName: "Familiya",
  formFieldInputPlaceholder__emailAddress: "Email manzilingiz",
  formButtonPrimary: "Davom etish",
  footerPageLink__help: "Yordam",
  signIn: {
    start: {
      title: "Bunker*cha’ga kirish",
      subtitle: "Doʻstlaringiz sizni kutyapti",
      actionText: "Akkauntingiz yoʻqmi?",
      actionLink: "Roʻyxatdan oʻtish",
    },
    password: {
      title: "Parolingizni kiriting",
      subtitle: "Bunkerga kirish uchun",
      actionLink: "Boshqa usul",
    },
    forgotPasswordAlternativeMethods: {
      title: "Parolni unutdingizmi?",
    },
  },
  signUp: {
    start: {
      title: "Akkaunt yaratish",
      subtitle: "Oʻynash uchun roʻyxatdan oʻting",
      actionText: "Akkauntingiz bormi?",
      actionLink: "Kirish",
    },
    emailCode: {
      title: "Emailni tasdiqlang",
      subtitle: "Emailingizga kelgan kodni kiriting",
      formTitle: "Tasdiqlash kodi",
      resendButton: "Kodni qayta yuborish",
    },
  },
  userButton: {
    action__signOut: "Chiqish",
    action__manageAccount: "Akkauntni boshqarish",
  },
};

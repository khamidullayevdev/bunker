import { SignUp } from "@clerk/nextjs";
import AuthShell from "@/components/AuthShell";
import { bunkerAppearance } from "@/lib/clerkAppearance";

export default function SignUpPage() {
  return (
    <AuthShell line="Yangi odam! Roʻyxatdan oʻting, natijalaringizni men yozib boraman. Bokschi boʻlsam ham, hisobni bilaman.">
      <SignUp appearance={bunkerAppearance} />
    </AuthShell>
  );
}

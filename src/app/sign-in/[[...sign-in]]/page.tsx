import { SignIn } from "@clerk/nextjs";
import AuthShell from "@/components/AuthShell";
import { bunkerAppearance } from "@/lib/clerkAppearance";

export default function SignInPage() {
  return (
    <AuthShell line="Salom! Men Qilichbek. Bunkerga kirishdan oldin akkauntga kiring, keyin gaplashamiz.">
      <SignIn appearance={bunkerAppearance} />
    </AuthShell>
  );
}

import HomeScreen from "@/components/screens/HomeScreen";

// This screen renders only in the browser, after the sign-in check, so there is
// nothing for instant-navigation validation to look at on the server.
export const instant = false;

export default function Page() {
  return <HomeScreen />;
}

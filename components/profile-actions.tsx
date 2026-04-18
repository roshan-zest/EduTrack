"use client";

import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function ProfileActions() {
  const router = useRouter();

  return (
    <button
      type="button"
      className="rounded-[1rem] bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white"
      onClick={async () => {
        try {
          const supabase = getSupabaseBrowserClient();
          await supabase.auth.signOut();
        } catch {
          // If browser client fails to initialize, still clear server session cookie.
        }

        await fetch("/api/auth/session", {
          method: "DELETE"
        });

        router.push("/signin");
        router.refresh();
      }}
    >
      Sign Out
    </button>
  );
}

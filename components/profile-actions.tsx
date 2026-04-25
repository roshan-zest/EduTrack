"use client";

import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const TAB_LOCAL_LOGOUT_KEY = "edutrack-tab-local-logout";

export function ProfileActions() {
  const router = useRouter();

  return (
    <button
      type="button"
      className="rounded-[1rem] bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white"
      onClick={async () => {
        if (typeof window !== "undefined") {
          sessionStorage.setItem(TAB_LOCAL_LOGOUT_KEY, "1");
        }

        try {
          const supabase = getSupabaseBrowserClient();
          await supabase.auth.signOut({ scope: "local" });
        } catch {
          // Keep tab-local logout state even if Supabase sign out fails.
        }

        router.push("/signin");
        router.refresh();
      }}
    >
      Sign Out
    </button>
  );
}

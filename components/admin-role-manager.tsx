"use client";

import { useEffect, useMemo, useState } from "react";

type ManagedUser = {
  id: string;
  email: string;
  role: "admin" | "teacher";
  createdAt?: string;
};

export function AdminRoleManager() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [status, setStatus] = useState("Loading users...");
  const [query, setQuery] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  async function loadUsers() {
    setStatus("Loading users...");

    const response = await fetch("/api/admin/users", { cache: "no-store" });
    const payload = (await response.json()) as {
      success: boolean;
      data?: ManagedUser[];
      error?: string;
    };

    if (!response.ok || !payload.success || !payload.data) {
      setStatus(payload.error ?? "Unable to load users");
      return;
    }

    setUsers(payload.data);
    setStatus(`Loaded ${payload.data.length} user account(s)`);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    if (!query.trim()) {
      return users;
    }

    const q = query.trim().toLowerCase();
    return users.filter((user) => user.email.toLowerCase().includes(q));
  }, [query, users]);

  async function updateRole(userId: string, role: "admin" | "teacher") {
    setUpdatingUserId(userId);

    const response = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ userId, role })
    });

    const payload = (await response.json()) as { success: boolean; error?: string };

    if (!response.ok || !payload.success) {
      setStatus(payload.error ?? "Unable to update role");
      setUpdatingUserId(null);
      return;
    }

    setUsers((current) => current.map((entry) => (entry.id === userId ? { ...entry, role } : entry)));
    setStatus("Role updated successfully");
    setUpdatingUserId(null);
  }

  return (
    <div className="glass-panel rounded-[1.8rem] p-6 md:p-7">
      <div className="flex flex-col gap-4 border-b border-slate-200/70 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Access Control</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-800">Admin Role Assignment</h3>
          <p className="mt-2 text-sm leading-7 text-slate-500">Grant or revoke admin access for authenticated users.</p>
        </div>

        <input
          className="apple-input w-full px-4 py-3 text-sm md:w-80"
          placeholder="Search by email"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <p className="mt-4 text-sm text-slate-500">{status}</p>

      <div className="mt-5 max-h-[540px] overflow-auto rounded-[1.2rem] border border-slate-200/70">
        <table className="min-w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-white/95 text-slate-500 backdrop-blur">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em]">Email</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em]">Role</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em]">Created</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em]">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => {
              const nextRole = user.role === "admin" ? "teacher" : "admin";

              return (
                <tr key={user.id} className="border-t border-slate-200/60 hover:bg-white/60">
                  <td className="px-4 py-3 font-medium text-slate-800">{user.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
                        user.role === "admin"
                          ? "bg-slate-800 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={updatingUserId === user.id}
                      onClick={() => updateRole(user.id, nextRole)}
                      className="rounded-[0.9rem] border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {updatingUserId === user.id ? "Updating..." : `Set ${nextRole}`}
                    </button>
                  </td>
                </tr>
              );
            })}

            {!filteredUsers.length ? (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-slate-500" colSpan={4}>
                  No users found for this filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

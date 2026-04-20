"use client";

import { useEffect, useMemo, useState } from "react";

type AccessRequest = {
  id: string;
  user_id: string | null;
  email: string;
  access_code: string;
  desired_role: "admin" | "teacher";
  status: "pending" | "approved" | "rejected";
  note?: string | null;
  created_at: string;
  approved_at?: string | null;
  rejected_at?: string | null;
};

export function AdminAccessRequestManager() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [status, setStatus] = useState("Loading access requests...");
  const [query, setQuery] = useState("");
  const [updatingRequestId, setUpdatingRequestId] = useState<string | null>(null);
  const [roleByRequestId, setRoleByRequestId] = useState<Record<string, "admin" | "teacher">>({});

  async function loadRequests(search = "", silent = false) {
    if (!silent) {
      setStatus("Loading access requests...");
    }

    const requestUrl = `/api/admin/access-requests?search=${encodeURIComponent(search)}`;

    const response = await fetch(requestUrl, {
      cache: "no-store"
    });
    const payload = (await response.json()) as {
      success: boolean;
      data?: AccessRequest[];
      error?: string;
    };

    if (!response.ok || !payload.success || !payload.data) {
      setStatus(payload.error ?? "Unable to load access requests");
      return;
    }

    const requestData = payload.data;

    setRequests(requestData);
    setRoleByRequestId((current) =>
      requestData.reduce<Record<string, "admin" | "teacher">>((accumulator, request) => {
        accumulator[request.id] = current[request.id] ?? request.desired_role ?? "teacher";
        return accumulator;
      }, {})
    );
    setStatus(`Loaded ${requestData.length} access request(s)`);
  }

  useEffect(() => {
    void loadRequests();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      void loadRequests(query, true);
    }, 2000);

    return () => {
      window.clearInterval(timer);
    };
  }, [query]);

  const filteredRequests = useMemo(() => {
    if (!query.trim()) {
      return requests;
    }

    const q = query.trim().toLowerCase();
    return requests.filter((request) => {
      return [request.email, request.access_code, request.status, request.note ?? "", request.id, request.user_id ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [query, requests]);

  async function approveRequest(requestId: string) {
    setUpdatingRequestId(requestId);

    const response = await fetch("/api/admin/access-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, role: roleByRequestId[requestId] ?? "teacher" })
    });

    const payload = (await response.json()) as { success: boolean; data?: { accessCode?: string }; error?: string };

    if (!response.ok || !payload.success) {
      setStatus(payload.error ?? "Unable to approve request");
      setUpdatingRequestId(null);
      return;
    }

    setRequests((current) =>
      current.map((entry) =>
        entry.id === requestId
          ? {
              ...entry,
              status: "approved",
              desired_role: roleByRequestId[requestId] ?? entry.desired_role,
              access_code: payload.data?.accessCode ?? entry.access_code,
              approved_at: new Date().toISOString(),
              rejected_at: null
            }
          : entry
      )
    );
    await loadRequests(query, true);
    setStatus("Access request approved");
    setUpdatingRequestId(null);
  }

  async function rejectRequest(requestId: string) {
    setUpdatingRequestId(requestId);

    const response = await fetch("/api/admin/access-requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId })
    });

    const payload = (await response.json()) as { success: boolean; error?: string };

    if (!response.ok || !payload.success) {
      setStatus(payload.error ?? "Unable to reject request");
      setUpdatingRequestId(null);
      return;
    }

    setRequests((current) =>
      current.map((entry) =>
        entry.id === requestId
          ? {
              ...entry,
              status: "rejected",
              desired_role: roleByRequestId[requestId] ?? entry.desired_role,
              rejected_at: new Date().toISOString(),
              approved_at: null
            }
          : entry
      )
    );
    await loadRequests(query, true);
    setStatus("Access request rejected");
    setUpdatingRequestId(null);
  }

  return (
    <div className="glass-panel rounded-[1.8rem] p-6 md:p-7">
      <div className="flex flex-col gap-4 border-b border-slate-200/70 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Access Queue</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-800">Registration Requests</h3>
          <p className="mt-2 text-sm leading-7 text-slate-500">Search by email, access code, status, or request text, then approve or reject access.</p>
        </div>

        <input
          className="apple-input w-full px-4 py-3 text-sm md:w-80"
          placeholder="Search email, code, status"
          value={query}
          onChange={(event) => {
            const value = event.target.value;
            setQuery(value);
            void loadRequests(value);
          }}
        />
      </div>

      <p className="mt-4 text-sm text-slate-500">{status}</p>

      <div className="mt-5 max-h-[620px] overflow-auto rounded-[1.2rem] border border-slate-200/70">
        <table className="min-w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-white/95 text-slate-500 backdrop-blur">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em]">Request ID</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em]">Email</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em]">User ID</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em]">Code</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em]">Role</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em]">Status</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em]">Created</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em]">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((request) => (
              <tr key={request.id} className="border-t border-slate-200/60 hover:bg-white/60">
                <td className="px-4 py-3 font-mono text-xs tracking-[0.12em] text-slate-500">{request.id}</td>
                <td className="px-4 py-3 font-medium text-slate-800">
                  <div>{request.email}</div>
                  {request.note ? <div className="mt-1 text-xs font-normal text-slate-500">{request.note}</div> : null}
                </td>
                <td className="px-4 py-3 font-mono text-xs tracking-[0.12em] text-slate-500">
                  {request.user_id ?? "Pending approval"}
                </td>
                <td className="px-4 py-3 font-mono text-sm tracking-[0.16em] text-slate-600">{request.access_code}</td>
                <td className="px-4 py-3">
                  <select
                    className="apple-input px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em]"
                    value={roleByRequestId[request.id] ?? request.desired_role}
                    onChange={(event) =>
                      setRoleByRequestId((current) => ({
                        ...current,
                        [request.id]: event.target.value as "admin" | "teacher"
                      }))
                    }
                  >
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
                      request.status === "approved"
                        ? "bg-emerald-50 text-emerald-700"
                        : request.status === "rejected"
                          ? "bg-rose-50 text-rose-700"
                          : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {request.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">{new Date(request.created_at).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={updatingRequestId === request.id || request.status === "approved"}
                      onClick={() => approveRequest(request.id)}
                      className="rounded-[0.9rem] border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {updatingRequestId === request.id ? "Working..." : "Approve"}
                    </button>
                    <button
                      type="button"
                      disabled={updatingRequestId === request.id || request.status === "rejected"}
                      onClick={() => rejectRequest(request.id)}
                      className="rounded-[0.9rem] border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {!filteredRequests.length ? (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-slate-500" colSpan={8}>
                  No access requests found for this filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
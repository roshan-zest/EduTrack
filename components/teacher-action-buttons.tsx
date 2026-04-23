"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function TeacherActionButtons({ teacherId, isSuspended }: { teacherId: string; isSuspended: boolean }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSuspending, setIsSuspending] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  async function handleSuspendToggle() {
    setIsSuspending(true);
    const action = isSuspended ? "restore" : "suspend";
    try {
      const response = await fetch(`/api/admin/teachers/${teacherId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      if (response.ok) {
        router.refresh();
      } else {
        alert(`Failed to ${action} teacher`);
      }
    } catch (e) {
      alert("An error occurred");
    } finally {
      setIsSuspending(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/teachers/${teacherId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete" })
      });
      if (response.ok) {
        // Redirect to teachers directory since this profile is now deleted
        router.push("/admin/teachers");
        router.refresh();
      } else {
        alert("Failed to delete teacher");
        setIsDeleting(false);
      }
    } catch (e) {
      alert("An error occurred");
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={isSuspending}
          onClick={handleSuspendToggle}
          className="rounded-[0.8rem] border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 disabled:opacity-50"
        >
          {isSuspending 
            ? (isSuspended ? "Restoring..." : "Suspending...") 
            : (isSuspended ? "Unsuspend" : "Suspend")}
        </button>

        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          className="rounded-[0.8rem] border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
        >
          Delete
        </button>

        <Link
          href={`/admin/teachers/${teacherId}/edit`}
          className="rounded-[0.8rem] bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-95"
        >
          Edit Profile
        </Link>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[1.8rem] bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-800">Delete Teacher Profile?</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Are you sure you want to delete this teacher? They will be removed from all dashboards and lose login access.
            </p>
            <div className="mt-4 rounded-xl bg-blue-50 p-3">
              <p className="text-xs font-semibold text-blue-800">
                <span className="mr-1 inline-block">ℹ️</span>
                This is a soft delete. The profile can be recovered within 10 days by contacting support.
              </p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Confirm Deletion"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

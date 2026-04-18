"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type ProfileEditorProps = {
  initialName: string;
  initialPhone?: string;
  initialDepartment?: string;
  initialDesignation?: string;
  initialBio?: string;
};

export function ProfileEditor({
  initialName,
  initialPhone,
  initialDepartment,
  initialDesignation,
  initialBio
}: ProfileEditorProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [fullName, setFullName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [department, setDepartment] = useState(initialDepartment ?? "");
  const [designation, setDesignation] = useState(initialDesignation ?? "");
  const [bio, setBio] = useState(initialBio ?? "");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          phone: phone.trim(),
          department: department.trim(),
          designation: designation.trim(),
          bio: bio.trim()
        }
      });

      if (error) {
        throw error;
      }

      setMessage("Profile updated successfully.");
      setEditing(false);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update profile.");
    }

    setSaving(false);
  }

  return (
    <div className="glass-panel rounded-[1.8rem] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Profile Editor</p>
          <p className="mt-2 text-sm leading-7 text-slate-500">Update personal details shown in your account profile.</p>
        </div>
        <button
          type="button"
          className="rounded-[1rem] border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
          onClick={() => setEditing((current) => !current)}
        >
          {editing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      {editing ? (
        <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Full Name</span>
            <input
              required
              className="apple-input px-4 py-3 text-sm"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">Phone</span>
              <input
                className="apple-input px-4 py-3 text-sm"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+91 90000 00000"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">Department</span>
              <input
                className="apple-input px-4 py-3 text-sm"
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                placeholder="Computer Science"
              />
            </label>
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Designation</span>
            <input
              className="apple-input px-4 py-3 text-sm"
              value={designation}
              onChange={(event) => setDesignation(event.target.value)}
              placeholder="Assistant Professor"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Bio</span>
            <textarea
              className="apple-input min-h-28 px-4 py-3 text-sm"
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              placeholder="Brief introduction, teaching interests, and strengths."
            />
          </label>

          <button
            type="submit"
            disabled={saving}
            className="w-fit rounded-[1rem] bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      ) : null}

      {message ? <p className="mt-4 text-sm text-slate-600">{message}</p> : null}
    </div>
  );
}

'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Teacher } from "@/lib/types";

interface EditTeacherFormProps {
  teacher: Teacher;
  teacherId: string;
}

export function EditTeacherForm({ teacher, teacherId }: EditTeacherFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: teacher.name,
    email: teacher.email,
    password: teacher.password || "",
    department: teacher.department,
    role: teacher.role,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch('/api/admin/teachers', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentEmail: teacher.email,
          email: formData.email,
          name: formData.name,
          password: formData.password,
          department: formData.department,
          role: formData.role
        })
      });

      const payload = (await response.json()) as { success?: boolean; error?: string };
      if (!response.ok || !payload.success) {
        throw new Error(payload.error ?? 'Failed to update teacher');
      }

      setMessage("✓ Teacher information updated successfully!");
      setTimeout(() => {
        router.refresh();
        router.push(`/admin/teachers/${teacherId}`);
      }, 1500);
    } catch (err) {
      const text = err instanceof Error ? err.message : "Failed to update teacher. Please try again.";
      setError(text);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-10 max-w-2xl">
      <div className="rounded-[1.6rem] border border-slate-200 bg-white/90 p-8 shadow-soft">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Faculty Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-[1rem] border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 placeholder-slate-500 transition focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-0"
              placeholder="Enter teacher name"
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-[1rem] border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 placeholder-slate-500 transition focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-0"
              placeholder="teacher@sjr.edu"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Login Password</label>
            <input
              type="text"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-[1rem] border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 placeholder-slate-500 transition focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-0 font-mono"
              placeholder="Enter password"
            />
            <p className="mt-1.5 text-xs text-slate-500">Teachers use this to log into their account.</p>
          </div>

          {/* Department Field */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Department</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full rounded-[1rem] border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 transition focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-0"
            >
              <option value="BCA">BCA</option>
              <option value="CSE">Computer Science</option>
              <option value="ECE">Electronics</option>
              <option value="IT">Information Technology</option>
              <option value="MECH">Mechanical</option>
              <option value="CIVIL">Civil Engineering</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Access Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full rounded-[1rem] border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 transition focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-0"
            >
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
            <p className="mt-1.5 text-xs text-slate-500">Switch this person between Teacher and Admin access.</p>
          </div>

          {/* Status Messages */}
          {message && (
            <div className="rounded-[1rem] border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-700">{message}</p>
            </div>
          )}

          {error && (
            <div className="rounded-[1rem] border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-700">{error}</p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-[1rem] bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <Link
              href={`/admin/teachers/${teacherId}`}
              className="flex-1 rounded-[1rem] border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>

      {/* Info Box */}
      <div className="mt-6 rounded-[1rem] border border-blue-200 bg-blue-50 p-4">
        <p className="text-xs text-blue-700">
          <span className="font-semibold">Note:</span> Changes are saved server-side. Email, password, role, and status stay in sync with actual login credentials.
        </p>
      </div>
    </section>
  );
}

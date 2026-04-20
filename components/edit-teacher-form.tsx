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

  // Initialize with teacher data, checking localStorage first for updates
  const [initialTeacher] = useState(() => {
    if (typeof window !== 'undefined') {
      const updatedTeachersStr = localStorage.getItem('edutrack_teachers');
      if (updatedTeachersStr) {
        try {
          const updatedTeachers = JSON.parse(updatedTeachersStr);
          if (updatedTeachers[teacher.id]) {
            return updatedTeachers[teacher.id];
          }
        } catch (e) {
          // If JSON parsing fails, use initial teacher
        }
      }
    }
    return teacher;
  });

  const [formData, setFormData] = useState({
    name: initialTeacher.name,
    email: initialTeacher.email,
    password: initialTeacher.password || "",
    department: initialTeacher.department,
    role: initialTeacher.role,
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Save updated teacher to localStorage
      const updatedTeacher = {
        ...teacher,
        ...formData,
      };
      
      // Get all updated teachers from localStorage
      const updatedTeachersStr = localStorage.getItem('edutrack_teachers') || '{}';
      const updatedTeachers = JSON.parse(updatedTeachersStr);
      updatedTeachers[teacher.id] = updatedTeacher;
      localStorage.setItem('edutrack_teachers', JSON.stringify(updatedTeachers));

      if (formData.role !== teacher.role || formData.email !== teacher.email) {
        const roleResponse = await fetch('/api/admin/users', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: formData.email,
            role: formData.role
          })
        });

        if (!roleResponse.ok && roleResponse.status !== 404) {
          const rolePayload = (await roleResponse.json()) as { error?: string };
          throw new Error(rolePayload.error ?? 'Failed to sync user role');
        }
      }

      setMessage("✓ Teacher information updated successfully!");
      setTimeout(() => {
        router.push(`/admin/teachers/${teacherId}`);
      }, 1500);
    } catch (err) {
      setError("Failed to update teacher. Please try again.");
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
          <span className="font-semibold">Note:</span> Changes are saved to the system. Password and role updates apply to linked login accounts when available.
        </p>
      </div>
    </section>
  );
}

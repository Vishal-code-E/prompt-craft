"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SignupFormProps = {
  onClose?: () => void; // allow optional close handler
};

export default function SignupForm({ onClose }: SignupFormProps) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // 👉 step 4 will wire this to your API / DB
    console.log("signup payload:", form);
    setLoading(false);
    if (onClose) onClose(); // close modal after signup
  }

  return (
    <div className="w-full max-w-md mx-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-lg relative z-[101]">
      {/* Close Button if passed */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-neutral-500 hover:text-black"
        >
          ✕
        </button>
      )}

      <div className="space-y-1 text-center mb-6">
        <h2 className="text-2xl font-bold text-black">Create your account</h2>
        <p className="text-sm text-neutral-600">
          Use email or continue with Google
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Your Name"
            autoComplete="name"
            required
            value={form.name}
            onChange={handleChange}
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
            value={form.email}
            onChange={handleChange}
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            required
            value={form.password}
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-black px-4 py-2 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-6 flex items-center">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="px-3 text-xs text-neutral-500">or</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <button
        onClick={() => signIn("google", { callbackUrl: "/" })}
        className="w-full rounded-lg bg-white px-4 py-2 font-semibold text-black border border-gray-200 shadow-sm transition hover:bg-gray-50"
      >
        Continue with Google
      </button>

      <p className="mt-4 text-center text-sm text-neutral-600">
        Already have an account?{" "}
        <a href="/signin" className="font-medium underline underline-offset-4">
          Sign in
        </a>
      </p>
    </div>
  );
}

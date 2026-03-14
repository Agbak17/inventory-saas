import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-xl w-full rounded-2xl border p-8 shadow-sm text-center">
        <h1 className="text-3xl font-semibold mb-3">
          Inventory SaaS
        </h1>
        <p className="text-gray-600 mb-6">
          Your cloud-powered inventory and analytics dashboard.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link href="/login" className="rounded-lg border px-4 py-2">
            Log in / Sign up
          </Link>
          <Link href="/dashboard" className="rounded-lg border px-4 py-2">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
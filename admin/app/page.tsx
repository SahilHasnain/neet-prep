import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">NEET Prep Admin</h1>
        <p className="text-[--color-text-secondary] mb-8">
          Manage your NEET preparation app content
        </p>
        <Link
          href="/videos"
          className="inline-block px-6 py-3 bg-[--color-accent-primary] text-white rounded-lg hover:bg-[--color-accent-secondary] transition"
        >
          Manage Videos
        </Link>
      </div>
    </div>
  );
}

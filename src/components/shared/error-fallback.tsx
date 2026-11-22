import Link from "next/link";

export function ErrorFallback({ reset }: { reset?: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fbfaf6] px-5 py-12 text-[#19372a]">
      <section className="w-full max-w-2xl rounded-lg border border-[#e2e9e2] bg-white p-6 shadow-sm sm:p-10" role="alert" aria-labelledby="error-fallback-title">
        <p className="text-sm font-semibold text-[#287154]">একটি অপ্রত্যাশিত সমস্যা</p>
        <h1 id="error-fallback-title" className="mt-3 text-2xl font-bold leading-relaxed sm:text-3xl">
          পৃষ্ঠা লোড করা যাচ্ছে না
        </h1>
        <p className="mt-4 leading-8 text-slate-600">
          অনুরোধটি সম্পন্ন করা যায়নি। আবার চেষ্টা করুন, অথবা হোমপেজ থেকে প্রয়োজনীয় তথ্য খুঁজে নিন।
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {reset ? (
            <button
              type="button"
              onClick={reset}
              className="min-h-11 rounded-md bg-[#153d2d] px-5 py-3 font-semibold text-white hover:bg-[#07583d]"
            >
              আবার চেষ্টা করুন
            </button>
          ) : null}
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-md border border-[#153d2d] px-5 py-3 font-semibold text-[#153d2d] hover:bg-[#f4f5ee]"
          >
            হোমে ফিরুন
          </Link>
        </div>
      </section>
    </main>
  );
}

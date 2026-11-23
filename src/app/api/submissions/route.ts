import { NextResponse } from "next/server";
import { validateSubmissionText } from "@/lib/submission-validation.mjs";
import { readLimitedJsonObject } from "@/lib/submission-body-limit.mjs";

const MAX_SUBMISSION_BODY_BYTES = 32 * 1024;
const categories = new Set(["education", "health", "police", "government", "business", "tourism", "transport", "community"]);
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  const bodyResult = await readLimitedJsonObject(request, MAX_SUBMISSION_BODY_BYTES);
  if (!bodyResult.ok) {
    const tooLarge = bodyResult.reason === "too_large";
    return NextResponse.json(
      { error: tooLarge ? "অনুরোধের তথ্য খুব বড়। নাম ও বিবরণ সংক্ষিপ্ত করুন।" : "সঠিক তথ্য পাঠানো হয়নি।" },
      { status: tooLarge ? 413 : 400 },
    );
  }
  const body: Record<string, unknown> = bodyResult.value;

  // Honeypot: quietly accept automated spam without storing it.
  if (clean(body.website, 200)) return NextResponse.json({ ok: true });

  const submissionType = body.submission_type === "correction" ? "correction" : body.submission_type === "new_entry" ? "new_entry" : "";
  const textValidation = validateSubmissionText(body.item_name, body.message);
  const itemName = textValidation.normalizedItemName;
  const message = textValidation.normalizedMessage;
  const submitterName = clean(body.submitter_name, 100);
  const contact = clean(body.contact, 120);
  const sourceUrl = clean(body.source_url, 500);
  const category = clean(body.category, 40);
  const entryId = clean(body.directory_entry_id, 36);

  if (!submissionType || !textValidation.itemNameValid || !textValidation.messageValid || body.consent !== true) {
    return NextResponse.json({ error: "নাম ২–১৮০ অক্ষর, বিবরণ ১০–৩,০০০ অক্ষর এবং সম্মতি প্রয়োজন।" }, { status: 400 });
  }
  if (submissionType === "new_entry" && !category) {
    return NextResponse.json({ error: "নতুন তথ্যের জন্য বিভাগ নির্বাচন করুন।" }, { status: 400 });
  }
  if (category && !categories.has(category)) {
    return NextResponse.json({ error: "বিভাগ নির্বাচন সঠিক নয়।" }, { status: 400 });
  }
  if (entryId && !uuidPattern.test(entryId)) {
    return NextResponse.json({ error: "প্রতিষ্ঠানের রেফারেন্স সঠিক নয়।" }, { status: 400 });
  }
  if (sourceUrl) {
    try {
      const parsed = new URL(sourceUrl);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") throw new Error("invalid protocol");
    } catch {
      return NextResponse.json({ error: "তথ্যসূত্রের লিংকটি সঠিক নয়।" }, { status: 400 });
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({ error: "জমা দেওয়ার ব্যবস্থা সাময়িকভাবে পাওয়া যাচ্ছে না।" }, { status: 503 });
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/information_submissions`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      submission_type: submissionType,
      directory_entry_id: entryId || null,
      category: category || null,
      item_name: itemName,
      submitter_name: submitterName || null,
      contact: contact || null,
      message,
      source_url: sourceUrl || null,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json({ error: "তথ্য জমা দেওয়া যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।" }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}

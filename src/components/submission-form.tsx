"use client";

import { useState, type FormEvent } from "react";
import { validateSubmissionText } from "@/lib/submission-validation.mjs";

type Props = {
  initialType?: "new_entry" | "correction";
  initialEntryId?: string;
  initialName?: string;
  initialCategory?: string;
};

const categoryOptions = [
  ["education", "শিক্ষা প্রতিষ্ঠান"], ["health", "হাসপাতাল ও স্বাস্থ্যসেবা"],
  ["police", "থানা ও আইনশৃঙ্খলা"], ["government", "সরকারি অফিস"],
  ["business", "ব্যবসা ও প্রতিষ্ঠান"], ["tourism", "দর্শনীয় স্থান"],
  ["transport", "পরিবহন"], ["community", "কমিউনিটি"],
];

export default function SubmissionForm({ initialType = "new_entry", initialEntryId = "", initialName = "", initialCategory = "" }: Props) {
  const [type, setType] = useState<"new_entry" | "correction">(initialType);
  const [name, setName] = useState(initialName);
  const [category, setCategory] = useState(initialCategory);
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [submitter, setSubmitter] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [nameError, setNameError] = useState("");
  const [messageError, setMessageError] = useState("");
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const textValidation = validateSubmissionText(name, message);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    const validation = validateSubmissionText(name, message);
    setNameError(validation.itemNameValid ? "" : "নামটি কমপক্ষে ২ অক্ষর লিখুন।");
    setMessageError(validation.messageValid ? "" : "বিবরণে কমপক্ষে ১০ অক্ষর লিখুন।");
    if (!validation.itemNameValid || !validation.messageValid) {
      setStatus({ ok: false, text: "নাম ও বিবরণ ঠিক করে আবার চেষ্টা করুন।" });
      return;
    }

    setBusy(true);
    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission_type: type,
          directory_entry_id: type === "correction" ? initialEntryId : "",
          item_name: validation.normalizedItemName,
          category,
          message: validation.normalizedMessage,
          contact,
          submitter_name: submitter,
          source_url: sourceUrl,
          consent,
          website,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "জমা দেওয়া যায়নি।");
      setStatus({ ok: true, text: "আপনার তথ্য জমা হয়েছে। যাচাই শেষে উপযুক্ত হলে প্রকাশ করা হবে।" });
      setMessage("");
      setMessageError("");
      setContact("");
      setSubmitter("");
      setSourceUrl("");
      setConsent(false);
    } catch (error) {
      setStatus({ ok: false, text: error instanceof Error ? error.message : "সমস্যা হয়েছে। আবার চেষ্টা করুন।" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div>
        <span className="mb-2 block text-sm font-semibold text-slate-700">জমার ধরন</span>
        <div role="group" aria-label="জমার ধরন" className="grid grid-cols-2 gap-2">
          <button type="button" aria-pressed={type === "new_entry"} onClick={() => setType("new_entry")} className={`rounded-xl border px-3 py-3 text-sm font-semibold ${type === "new_entry" ? "border-emerald-700 bg-emerald-50 text-emerald-800" : "border-slate-300 text-slate-600"}`}>নতুন তথ্য</button>
          <button type="button" aria-pressed={type === "correction"} onClick={() => setType("correction")} className={`rounded-xl border px-3 py-3 text-sm font-semibold ${type === "correction" ? "border-emerald-700 bg-emerald-50 text-emerald-800" : "border-slate-300 text-slate-600"}`}>ভুল সংশোধন</button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-slate-700">প্রতিষ্ঠান বা স্থানের নাম *</span>
          <input id="submission-item-name" required minLength={2} maxLength={180} value={name} aria-invalid={Boolean(nameError)} aria-describedby={nameError ? "submission-name-error submission-name-count" : "submission-name-count"} onChange={(e) => { const value = e.target.value; setName(value); if (validateSubmissionText(value, message).itemNameValid) setNameError(""); }} className="w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-emerald-600" placeholder="নাম লিখুন" />
          {nameError && <span id="submission-name-error" className="mt-1 block text-sm text-red-700">{nameError}</span>}
          <span id="submission-name-count" className="mt-1 block text-xs text-slate-500">পরিষ্কার করা নাম: {textValidation.itemNameLength.toLocaleString("bn-BD")} / ১৮০</span>
        </label>
        <label className="block"><span className="mb-1 block text-sm font-semibold text-slate-700">বিভাগ</span><select required={type === "new_entry"} value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3"><option value="">বিভাগ নির্বাচন করুন</option>{categoryOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      </div>
      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-slate-700">বিস্তারিত তথ্য *</span>
        <textarea id="submission-message" required minLength={10} maxLength={3000} rows={5} value={message} aria-invalid={Boolean(messageError)} aria-describedby={messageError ? "submission-message-error submission-message-count" : "submission-message-count"} onChange={(e) => { const value = e.target.value; setMessage(value); if (validateSubmissionText(name, value).messageValid) setMessageError(""); }} className="w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-emerald-600" placeholder="কোন তথ্য যোগ বা সংশোধন করতে হবে, বিস্তারিত লিখুন" />
        {messageError && <span id="submission-message-error" className="mt-1 block text-sm text-red-700">{messageError}</span>}
        <span id="submission-message-count" className="mt-1 block text-xs text-slate-500">পরিষ্কার করা বিবরণ: {textValidation.messageLength.toLocaleString("bn-BD")} / ৩,০০০ · কমপক্ষে ১০ অক্ষর</span>
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block"><span className="mb-1 block text-sm font-semibold text-slate-700">আপনার নাম</span><input maxLength={100} value={submitter} onChange={(e) => setSubmitter(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-emerald-600" placeholder="ঐচ্ছিক" /></label>
        <label className="block"><span className="mb-1 block text-sm font-semibold text-slate-700">যোগাযোগের নম্বর বা ইমেইল</span><input maxLength={120} value={contact} onChange={(e) => setContact(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-emerald-600" placeholder="ঐচ্ছিক" /></label>
      </div>
      <label className="block"><span className="mb-1 block text-sm font-semibold text-slate-700">তথ্যসূত্রের লিংক</span><input type="url" maxLength={500} value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-emerald-600" placeholder="https://... (ঐচ্ছিক)" /></label>
      <label className="hidden" aria-hidden="true">ওয়েবসাইট<input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
      <label className="flex items-start gap-3 text-sm leading-6 text-slate-600"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required className="mt-1" /><span>আমি নিশ্চিত করছি, দেওয়া তথ্য যাচাইয়ের জন্য জমা দিচ্ছি। যাচাই সম্পন্ন না হওয়া পর্যন্ত এটি প্রকাশ করা হবে না।</span></label>
      {status && <p role={status.ok ? "status" : "alert"} className={`rounded-xl p-4 text-sm ${status.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>{status.text}</p>}
      <button disabled={busy} className="w-full rounded-xl bg-emerald-700 px-5 py-3.5 font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60">{busy ? "জমা হচ্ছে..." : "তথ্য জমা দিন"}</button>
      <p className="text-xs leading-5 text-slate-500">জমা দেওয়া তথ্য সরাসরি প্রকাশিত হয় না। প্রশাসনিক যাচাইয়ের পর সিদ্ধান্ত নেওয়া হবে।</p>
    </form>
  );
}

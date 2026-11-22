export const primaryNavigation = [
  { href: "/", label: "হোম" },
  { href: "/district", label: "জেলা পরিচিতি" },
  { href: "/map", label: "মানচিত্র" },
  { href: "/upazila", label: "উপজেলা" },
  { href: "/municipality", label: "পৌরসভা" },
  { href: "/directory", label: "তথ্যভান্ডার" },
  { href: "/statistics", label: "পরিসংখ্যান" },
  { href: "/data", label: "তথ্য ক্যাটালগ" },
  { href: "/search", label: "তথ্য খুঁজুন" },
] as const;

export const submitNavigation = { href: "/submit", label: "তথ্য জমা দিন" } as const;

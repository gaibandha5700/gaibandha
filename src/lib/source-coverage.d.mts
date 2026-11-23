export type PublicCensusSourceRecord = {
  district_id?: string | null;
  upazila_id?: string | null;
  union_id?: string | null;
  municipality_id?: string | null;
  ward_id?: string | null;
  source_url?: string | null;
  source_checked_at?: string | null;
};

export type PublicDirectorySourceRecord = {
  category?: string | null;
  source_url?: string | null;
  source_checked_at?: string | null;
};

export type SourceCoverageMetrics = {
  total: number;
  sourceUrlCount: number;
  checkedCount: number;
  latestCheckedAt: string | null;
};

export type PublicSourceCoverage = {
  census: SourceCoverageMetrics & {
    levels: Record<"district" | "upazila" | "union" | "municipality" | "municipal_ward" | "union_ward" | "other", number>;
  };
  directory: SourceCoverageMetrics & { categories: Record<string, number> };
};

export function summarizePublicSourceCoverage(
  censusRecords?: PublicCensusSourceRecord[],
  directoryRecords?: PublicDirectorySourceRecord[],
): PublicSourceCoverage;

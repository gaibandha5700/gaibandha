export type Metric = "population" | "households" | "male" | "female";
export type ComparisonRow = {
  name: string;
  population: number | null;
  households: number | null;
  male: number | null;
  female: number | null;
};
export function buildMetricHref(currentUrl: string, metric: Metric): string;
export function buildShareUrl(currentUrl: string, metric: Metric): string;
export function escapeCsvCell(value: string | number | null | undefined): string;
export function buildStatisticsCsv(rows: ComparisonRow[], metric: Metric, label: string, sourceName?: string | null, sourceUrl?: string | null, sourceCheckedAt?: string | null): string;

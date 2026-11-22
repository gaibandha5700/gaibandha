export type UpdatedAtRecord = {
  updated_at?: string | null;
};

export function latestUpdatedAt(items: readonly UpdatedAtRecord[]): string | null;
export function dateFromTimestamp(value: string | null | undefined): Date | undefined;

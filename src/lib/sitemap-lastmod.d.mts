export type UpdatedAtRecord = {
  updated_at?: string | null;
};

export function latestUpdatedAt(items: readonly UpdatedAtRecord[]): string | null;

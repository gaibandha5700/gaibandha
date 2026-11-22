export type DirectoryAreaFilter =
  | { type: "all"; id: null }
  | { type: "union" | "municipality"; id: string };

export function parseDirectoryAreaFilter(value: string): DirectoryAreaFilter | null;

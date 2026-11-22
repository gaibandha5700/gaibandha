export type DirectoryAreaFilter =
  | { type: "all"; id: null }
  | { type: "union" | "municipality"; id: string };

export type ParsedDirectoryArea = { type: "union" | "municipality"; id: string };
export type DirectoryAreaSelection = { valid: boolean; value: string; parsed: ParsedDirectoryArea | null };
export type DirectoryWardSelection = { valid: boolean; value: string };

export function parseDirectoryAreaFilter(value: string): DirectoryAreaFilter | null;
export function validateDirectoryAreaSelection(area: string, parsedArea: DirectoryAreaFilter | null, availableAreaValues: string[]): DirectoryAreaSelection;
export function validateDirectoryWardSelection(wardId: string, selectedArea: string, selectedWardIds: string[]): DirectoryWardSelection;

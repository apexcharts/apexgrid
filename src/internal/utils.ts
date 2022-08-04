export function isDefined<T>(value: T) {
  return value !== undefined && value !== null;
}

export function normalizeCase(string: string, caseSensitive?: boolean) {
  return caseSensitive ? string : string.toLowerCase();
}

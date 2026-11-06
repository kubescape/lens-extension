const namespacePattern = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

/** Validate before passing values to the SDK, which builds a shell command. */
export function normalizeExcludedNamespaces(value: unknown = []): string[] {
  if (!Array.isArray(value) || value.some(namespace => typeof namespace !== "string")) {
    throw new Error("Excluded namespaces must be a list of namespace names.");
  }

  const namespaces = value.map(namespace => namespace.trim()).filter(Boolean);

  if (namespaces.some(namespace => !namespacePattern.test(namespace))) {
    throw new Error("Use namespace names of 1–63 lowercase letters, digits or hyphens, starting and ending with a letter or digit.");
  }

  return [...new Set(namespaces)];
}

export function parseExcludedNamespaces(value: string): string[] {
  return normalizeExcludedNamespaces(value.split(","));
}

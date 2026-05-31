const NODE_API_PREFIX = "/api";
const FORBIDDEN_IMPORT_SEGMENTS = ["src/sre_agent", "artifacts/api-server/src", "openspec/"];

export function assertNodeApiOrigin(input: string | undefined): string | null {
  if (!input || input.trim() === "") {
    return null;
  }

  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    throw new Error(
      "VITE_NODE_API_ORIGIN must be an absolute URL pointing to the Node.js backend host.",
    );
  }

  if (parsed.pathname !== "/" && parsed.pathname !== "") {
    throw new Error(
      "VITE_NODE_API_ORIGIN must not include a path; generated client requests already target /api paths.",
    );
  }

  parsed.pathname = "";
  parsed.search = "";
  parsed.hash = "";
  return parsed.toString().replace(/\/$/, "");
}

export function assertApiPath(pathname: string): void {
  if (!pathname.startsWith(NODE_API_PREFIX)) {
    throw new Error(`API calls must target ${NODE_API_PREFIX} paths. Received: ${pathname}`);
  }
}

export function assertContractBoundaryImport(importPath: string): void {
  const violatingSegment = FORBIDDEN_IMPORT_SEGMENTS.find((segment) =>
    importPath.includes(segment),
  );

  if (violatingSegment) {
    throw new Error(
      `Forbidden import path "${importPath}". Use shared contracts and generated clients only.`,
    );
  }
}
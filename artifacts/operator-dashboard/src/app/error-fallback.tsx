import { normalizeApiError } from "@/lib/api/error-adapter";

type AppErrorFallbackProps = {
  error: unknown;
};

export function AppErrorFallback({ error }: AppErrorFallbackProps) {
  const normalized = normalizeApiError(error);

  return (
    <div role="alert" className="error-state">
      <h2>Dashboard unavailable</h2>
      <p>{normalized.message}</p>
      <p className="text-meta">
        Error type: {normalized.kind}
        {normalized.status != null ? ` (${normalized.status})` : ""}
      </p>
    </div>
  );
}

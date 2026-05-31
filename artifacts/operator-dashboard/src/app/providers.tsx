import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { AppErrorFallback } from "@/app/error-fallback";
import { getRetryDelayMs, shouldRetryRequest } from "@/lib/api/retry-policy";

type AppProvidersProps = {
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: unknown;
};

class AppErrorBoundary extends React.Component<AppProvidersProps, ErrorBoundaryState> {
  public constructor(props: AppProvidersProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  public static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  public render() {
    if (this.state.hasError) {
      return <AppErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: shouldRetryRequest,
      retryDelay: getRetryDelayMs,
    },
  },
});

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </AppErrorBoundary>
  );
}
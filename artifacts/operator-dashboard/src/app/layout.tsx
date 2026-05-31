import { Link } from "wouter";
import { ROUTES } from "@/app/routes";

type AppLayoutProps = {
  children: React.ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>SRE Operator Dashboard</h1>
        <nav className="app-nav" aria-label="Primary">
          <Link href={ROUTES.incidents}>Incidents</Link>
          <Link href={ROUTES.phaseStatus}>Phase Status</Link>
          <Link href={ROUTES.accuracySummary}>Accuracy Summary</Link>
        </nav>
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}
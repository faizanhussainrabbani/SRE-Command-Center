import { Link } from "wouter";
import { ROUTES } from "@/app/routes";

type AppLayoutProps = {
  children: React.ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-title-wrap">
          <h1 className="app-title">SRE Operator Dashboard</h1>
          <p className="app-subtitle">SYS-OP-01 / REGION: US-EAST-1 / STATUS: ACTIVE</p>
        </div>
        <div className="app-nav-wrap">
          <nav className="app-nav" aria-label="Primary">
            <Link href={ROUTES.incidents}>Incidents</Link>
            <Link href={ROUTES.phaseStatus}>Phase Status</Link>
            <Link href={ROUTES.accuracySummary}>Accuracy Summary</Link>
          </nav>
        </div>
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}
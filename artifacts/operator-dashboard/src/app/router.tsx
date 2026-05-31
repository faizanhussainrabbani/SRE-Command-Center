import { Route, Switch } from "wouter";
import { AppLayout } from "@/app/layout";
import { ROUTES } from "@/app/routes";
import { AccuracySummaryPage } from "@/features/accuracy/accuracy-summary-page";
import { IncidentDetailPage } from "@/features/incidents/incident-detail-page";
import { IncidentFeedPage } from "@/features/incidents/incident-feed-page";
import { PhaseStatusPage } from "@/features/phases/phase-status-page";

function NotFoundPage() {
  return (
    <section>
      <h2>Page not found</h2>
      <p>Use the navigation links to return to an operator workflow.</p>
    </section>
  );
}

export function AppRouter() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={IncidentFeedPage} />
        <Route path={ROUTES.incidents} component={IncidentFeedPage} />
        <Route path={ROUTES.incidentDetail} component={IncidentDetailPage} />
        <Route path={ROUTES.phaseStatus} component={PhaseStatusPage} />
        <Route path={ROUTES.accuracySummary} component={AccuracySummaryPage} />
        <Route component={NotFoundPage} />
      </Switch>
    </AppLayout>
  );
}
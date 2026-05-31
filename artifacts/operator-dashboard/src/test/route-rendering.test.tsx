import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Router } from "wouter";
import { AppLayout } from "@/app/layout";
import { AppRouter } from "@/app/router";
import { ROUTES } from "@/app/routes";

type RouteElement = {
  props?: {
    path?: string;
    component?: unknown;
    children?: unknown;
  };
};

function collectRouteElements(node: unknown, acc: RouteElement[] = []): RouteElement[] {
  if (Array.isArray(node)) {
    for (const child of node) {
      collectRouteElements(child, acc);
    }
    return acc;
  }

  if (!React.isValidElement(node)) {
    return acc;
  }

  const element = node as RouteElement;
  if ("path" in (element.props ?? {}) || "component" in (element.props ?? {})) {
    acc.push(element);
  }

  collectRouteElements(element.props?.children, acc);
  return acc;
}

export async function runRouteRenderingSuite(): Promise<void> {
  const staticLocationHook = (): [string, (nextPath: string) => void] => ["/incidents", () => {}];

  const shellMarkup = renderToStaticMarkup(
    <Router hook={staticLocationHook}>
      <AppLayout>
        <section>Route render probe</section>
      </AppLayout>
    </Router>,
  );

  assert.ok(shellMarkup.includes("SRE Operator Dashboard"));
  assert.ok(shellMarkup.includes('href="/incidents"'));
  assert.ok(shellMarkup.includes('href="/phases/status"'));
  assert.ok(shellMarkup.includes('href="/accuracy/summary"'));
  assert.ok(shellMarkup.includes("Route render probe"));

  const routerElement = AppRouter();
  const routeChildren = collectRouteElements(routerElement);

  const paths = routeChildren
    .map((route) => route.props?.path)
    .filter((path): path is string => typeof path === "string");

  assert.ok(paths.includes("/"));
  assert.ok(paths.includes(ROUTES.incidents));
  assert.ok(paths.includes(ROUTES.incidentDetail));
  assert.ok(paths.includes(ROUTES.phaseStatus));
  assert.ok(paths.includes(ROUTES.accuracySummary));

  const fallbackRoute = routeChildren.find((route) => route.props?.path === undefined);
  assert.ok(fallbackRoute, "router should include a fallback route");
  assert.ok(fallbackRoute?.props?.component, "fallback route should declare a component");
}
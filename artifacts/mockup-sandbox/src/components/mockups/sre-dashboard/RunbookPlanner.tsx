import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  GitBranch,
  Lock,
  Network,
  Plus,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Users,
  Zap,
  XCircle,
  ArrowRight,
  Settings,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

const services = [
  { id: "payments-service", label: "payments-service", tier: "P0", phase: "ASSIST", autoRate: 62 },
  { id: "api-gateway", label: "api-gateway", tier: "P0", phase: "ASSIST", autoRate: 88 },
  { id: "auth-service", label: "auth-service", tier: "P0", phase: "OBSERVE", autoRate: 0 },
  { id: "recommendation-engine", label: "recommendation-engine", tier: "P1", phase: "ASSIST", autoRate: 95 },
  { id: "notification-service", label: "notification-service", tier: "P2", phase: "AUTOMATE", autoRate: 100 },
];

const guardrailConfig: Record<string, {
  maxPodsAffected: number;
  maxTrafficPct: number;
  cooldownSecs: number;
  blastBudget: number;
  requireApproval: boolean;
}> = {
  "payments-service": { maxPodsAffected: 3, maxTrafficPct: 20, cooldownSecs: 300, blastBudget: 40, requireApproval: true },
  "api-gateway":       { maxPodsAffected: 6, maxTrafficPct: 50, cooldownSecs: 120, blastBudget: 60, requireApproval: false },
  "auth-service":      { maxPodsAffected: 2, maxTrafficPct: 10, cooldownSecs: 600, blastBudget: 20, requireApproval: true },
  "recommendation-engine": { maxPodsAffected: 8, maxTrafficPct: 80, cooldownSecs: 60, blastBudget: 75, requireApproval: false },
  "notification-service":  { maxPodsAffected: 12, maxTrafficPct: 100, cooldownSecs: 30, blastBudget: 90, requireApproval: false },
};

const approvalRules = [
  { id: 1, action: "Pod Restart (rolling)", service: "payments-service", condition: "conf ≥ 90% AND blast < 40", approval: "AUTO", sla: "—" },
  { id: 2, action: "Pod Restart (rolling)", service: "payments-service", condition: "conf < 90% OR blast ≥ 40", approval: "ON-CALL", sla: "5 min" },
  { id: 3, action: "Memory Limit Patch",   service: "payments-service", condition: "always",                    approval: "LEAD-SRE", sla: "15 min" },
  { id: 4, action: "Traffic Shift",        service: "api-gateway",       condition: "conf ≥ 95% AND night",     approval: "AUTO", sla: "—" },
  { id: 5, action: "Traffic Shift",        service: "api-gateway",       condition: "conf ≥ 95% AND business",  approval: "ON-CALL", sla: "3 min" },
  { id: 6, action: "Rollback Deployment",  service: "ALL",               condition: "always",                   approval: "LEAD-SRE", sla: "10 min" },
  { id: 7, action: "Scale-Up Replica",     service: "recommendation-engine", condition: "conf ≥ 80%",           approval: "AUTO", sla: "—" },
];

const blastScenario = {
  service: "payments-service",
  action: "Rolling restart (3 pods)",
  directImpact: { pods: 3, nodes: 2, trafficPct: 18 },
  downstream: [
    { service: "checkout-service", risk: "MEDIUM", reason: "synchronous HTTP dependency", users: "~12k" },
    { service: "order-history",    risk: "LOW",    reason: "async queue consumer",         users: "~800" },
    { service: "fraud-detection",  risk: "LOW",    reason: "retry-safe gRPC",              users: "~12k" },
  ],
  upstream: [
    { service: "api-gateway",      risk: "LOW",    reason: "circuit breaker configured",   users: "—" },
  ],
  blastScore: 34,
  eligible: true,
  approvalPath: "AUTO-EXECUTE",
  estimatedRecovery: "1m 40s",
};

const phaseBadgeColor: Record<string, string> = {
  OBSERVE:   "bg-zinc-700 text-zinc-300",
  ASSIST:    "bg-blue-900 text-blue-300",
  AUTOMATE:  "bg-emerald-900 text-emerald-300",
};

const approvalBadgeStyle: Record<string, string> = {
  AUTO:      "bg-emerald-900/60 text-emerald-300 border border-emerald-700",
  "ON-CALL": "bg-amber-900/60 text-amber-300 border border-amber-700",
  "LEAD-SRE":"bg-red-900/60 text-red-300 border border-red-700",
};

const riskColor: Record<string, string> = {
  LOW:    "text-emerald-400",
  MEDIUM: "text-amber-400",
  HIGH:   "text-red-400",
};

export function RunbookPlanner() {
  const [selectedService, setSelectedService] = useState("payments-service");
  const [activeTab, setActiveTab] = useState<"guardrails" | "blast" | "workflow">("guardrails");
  const cfg = guardrailConfig[selectedService];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-mono flex flex-col">

      {/* Top header */}
      <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-50 flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-500" />
            RUNBOOK &amp; REMEDIATION PLANNER
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">Safety guardrails · Blast radius · Approval workflows</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="text-zinc-500">ENVIRONMENT</span>
          <span className="text-emerald-400 font-bold">US-EAST-1 / PROD</span>
          <span className="text-zinc-500">LAST SAVE</span>
          <span className="text-zinc-300">10:48:22Z</span>
          <button className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded transition-colors">
            SAVE &amp; APPLY
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* Left sidebar — service list */}
        <div className="w-56 border-r border-zinc-800 flex flex-col shrink-0">
          <div className="px-4 py-3 border-b border-zinc-800">
            <span className="text-xs text-zinc-500 uppercase tracking-widest">Services</span>
          </div>
          <div className="flex flex-col gap-0.5 p-2 flex-1">
            {services.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedService(s.id)}
                className={`w-full text-left px-3 py-2.5 rounded text-xs transition-colors flex flex-col gap-1 ${
                  selectedService === s.id
                    ? "bg-zinc-800 border border-zinc-600 text-zinc-100"
                    : "text-zinc-400 hover:bg-zinc-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold truncate">{s.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    s.tier === "P0" ? "bg-red-900/50 text-red-400" :
                    s.tier === "P1" ? "bg-amber-900/50 text-amber-400" :
                    "bg-zinc-800 text-zinc-500"
                  }`}>{s.tier}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${phaseBadgeColor[s.phase]}`}>{s.phase}</span>
                  <span className={`text-[10px] ${s.autoRate >= 90 ? "text-emerald-400" : s.autoRate >= 60 ? "text-amber-400" : "text-zinc-500"}`}>
                    {s.autoRate}% AUTO
                  </span>
                </div>
              </button>
            ))}
            <button className="mt-2 w-full px-3 py-2 rounded border border-dashed border-zinc-700 text-zinc-600 text-xs hover:border-zinc-500 hover:text-zinc-400 flex items-center justify-center gap-1 transition-colors">
              <Plus className="w-3 h-3" /> Add service
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Service header + tab bar */}
          <div className="border-b border-zinc-800 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Server className="w-4 h-4 text-zinc-400" />
              <span className="font-bold text-zinc-100">{selectedService}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                services.find(s=>s.id===selectedService)?.tier === "P0"
                  ? "bg-red-900/50 text-red-400"
                  : services.find(s=>s.id===selectedService)?.tier === "P1"
                  ? "bg-amber-900/50 text-amber-400"
                  : "bg-zinc-800 text-zinc-500"
              }`}>{services.find(s=>s.id===selectedService)?.tier}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded ${phaseBadgeColor[services.find(s=>s.id===selectedService)?.phase ?? "OBSERVE"]}`}>
                {services.find(s=>s.id===selectedService)?.phase}
              </span>
            </div>
            <div className="flex gap-1">
              {(["guardrails", "blast", "workflow"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 text-xs font-bold rounded transition-colors ${
                    activeTab === tab
                      ? "bg-zinc-700 text-zinc-100"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {tab === "guardrails" ? "GUARDRAILS" : tab === "blast" ? "BLAST RADIUS" : "APPROVAL FLOW"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">

            {/* ── GUARDRAILS TAB ── */}
            {activeTab === "guardrails" && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">

                  {/* Blast radius limits */}
                  <Card className="bg-zinc-900 border-zinc-800 col-span-2">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xs text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-amber-400" />
                        Blast Radius Limits
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs text-zinc-500">Max pods affected per action</label>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-zinc-800 rounded px-3 py-2 text-sm font-bold text-zinc-100 flex items-center justify-between">
                              <span>{cfg.maxPodsAffected}</span>
                              <div className="flex gap-1">
                                <button className="w-5 h-5 bg-zinc-700 rounded text-xs flex items-center justify-center hover:bg-zinc-600">−</button>
                                <button className="w-5 h-5 bg-zinc-700 rounded text-xs flex items-center justify-center hover:bg-zinc-600">+</button>
                              </div>
                            </div>
                            <span className="text-xs text-zinc-600">pods</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-zinc-500">Max traffic shift per action</label>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-zinc-800 rounded px-3 py-2 text-sm font-bold text-zinc-100 flex items-center justify-between">
                              <span>{cfg.maxTrafficPct}%</span>
                              <div className="flex gap-1">
                                <button className="w-5 h-5 bg-zinc-700 rounded text-xs flex items-center justify-center hover:bg-zinc-600">−</button>
                                <button className="w-5 h-5 bg-zinc-700 rounded text-xs flex items-center justify-center hover:bg-zinc-600">+</button>
                              </div>
                            </div>
                            <span className="text-xs text-zinc-600">%</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-zinc-500">Blast radius budget ceiling</label>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-zinc-400 font-bold">{cfg.blastBudget} / 100</span>
                              <span className={cfg.blastBudget <= 40 ? "text-emerald-400" : cfg.blastBudget <= 70 ? "text-amber-400" : "text-red-400"}>
                                {cfg.blastBudget <= 40 ? "CONSERVATIVE" : cfg.blastBudget <= 70 ? "MODERATE" : "AGGRESSIVE"}
                              </span>
                            </div>
                            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${cfg.blastBudget <= 40 ? "bg-emerald-500" : cfg.blastBudget <= 70 ? "bg-amber-500" : "bg-red-500"}`}
                                style={{ width: `${cfg.blastBudget}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-zinc-500">Cooldown between actions</label>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-zinc-800 rounded px-3 py-2 text-sm font-bold text-zinc-100 flex items-center justify-between">
                              <span>{cfg.cooldownSecs}s</span>
                              <div className="flex gap-1">
                                <button className="w-5 h-5 bg-zinc-700 rounded text-xs flex items-center justify-center hover:bg-zinc-600">−</button>
                                <button className="w-5 h-5 bg-zinc-700 rounded text-xs flex items-center justify-center hover:bg-zinc-600">+</button>
                              </div>
                            </div>
                            <span className="text-xs text-zinc-600">secs</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Phase Gate */}
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xs text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <GitBranch className="w-4 h-4 text-blue-400" />
                        Phase Gate
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {["OBSERVE", "ASSIST", "AUTOMATE"].map(phase => {
                        const current = services.find(s=>s.id===selectedService)?.phase;
                        const active = phase === current;
                        const done = (current === "ASSIST" && phase === "OBSERVE") || (current === "AUTOMATE");
                        return (
                          <div key={phase} className={`flex items-center gap-3 p-2.5 rounded border ${
                            active ? "border-blue-700 bg-blue-950/30" :
                            done   ? "border-emerald-900 bg-emerald-950/20" :
                                     "border-zinc-800 bg-zinc-950/50 opacity-50"
                          }`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                              done ? "bg-emerald-900 text-emerald-400" :
                              active ? "bg-blue-900 text-blue-300" :
                              "bg-zinc-800 text-zinc-600"
                            }`}>
                              {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : active ? <Zap className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-zinc-200">{phase}</div>
                              <div className="text-[10px] text-zinc-500">
                                {phase === "OBSERVE" ? "Shadow mode only" : phase === "ASSIST" ? "Approval-gated actions" : "Full autonomy"}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <Separator className="bg-zinc-800 my-2" />
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-500">Require approval</span>
                        <div className={`flex items-center gap-1 font-bold ${cfg.requireApproval ? "text-amber-400" : "text-emerald-400"}`}>
                          {cfg.requireApproval ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                          {cfg.requireApproval ? "ON" : "OFF"}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Allowed action types */}
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xs text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-zinc-400" />
                      Permitted Remediation Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { action: "Pod Restart (rolling)", allowed: true, risk: "LOW" },
                        { action: "Pod Restart (force)",   allowed: false, risk: "HIGH" },
                        { action: "Scale-Up Replicas",     allowed: true, risk: "LOW" },
                        { action: "Scale-Down Replicas",   allowed: false, risk: "MEDIUM" },
                        { action: "Traffic Shift",         allowed: true, risk: "MEDIUM" },
                        { action: "Circuit Breaker Open",  allowed: true, risk: "MEDIUM" },
                        { action: "Rollback Deployment",   allowed: true, risk: "HIGH" },
                        { action: "Memory Limit Patch",    allowed: true, risk: "LOW" },
                        { action: "Node Drain",            allowed: false, risk: "HIGH" },
                      ].map(({ action, allowed, risk }) => (
                        <div key={action} className={`flex items-center justify-between p-2.5 rounded border text-xs ${
                          allowed ? "border-zinc-700 bg-zinc-800/50" : "border-zinc-800/50 bg-zinc-950/50 opacity-60"
                        }`}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${allowed ? "bg-emerald-400" : "bg-zinc-600"}`} />
                            <span className={allowed ? "text-zinc-200" : "text-zinc-500"}>{action}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] ${riskColor[risk]}`}>{risk}</span>
                            <div className={`w-8 h-4 rounded-full flex items-center px-0.5 cursor-pointer transition-colors ${allowed ? "bg-emerald-700 justify-end" : "bg-zinc-700 justify-start"}`}>
                              <div className="w-3 h-3 rounded-full bg-white" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ── BLAST RADIUS TAB ── */}
            {activeTab === "blast" && (
              <div className="space-y-4">
                {/* Scenario header */}
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xs text-zinc-400 uppercase tracking-widest flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Network className="w-4 h-4 text-blue-400" />
                        Blast Radius Simulation
                      </span>
                      <span className="text-[10px] bg-zinc-800 px-2 py-1 rounded text-zinc-500 normal-case font-normal">
                        Proposed action
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start justify-between gap-6">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded border border-zinc-700">
                          <Server className="w-4 h-4 text-zinc-400 shrink-0" />
                          <div>
                            <span className="text-xs text-zinc-500">Service</span>
                            <p className="text-sm font-bold text-zinc-100">{blastScenario.service}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-zinc-600 mx-2" />
                          <div>
                            <span className="text-xs text-zinc-500">Action</span>
                            <p className="text-sm font-bold text-amber-300">{blastScenario.action}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-zinc-800/60 rounded p-2.5">
                            <p className="text-[10px] text-zinc-500 uppercase">Pods affected</p>
                            <p className="text-lg font-bold text-zinc-100">{blastScenario.directImpact.pods}</p>
                          </div>
                          <div className="bg-zinc-800/60 rounded p-2.5">
                            <p className="text-[10px] text-zinc-500 uppercase">Nodes</p>
                            <p className="text-lg font-bold text-zinc-100">{blastScenario.directImpact.nodes}</p>
                          </div>
                          <div className="bg-zinc-800/60 rounded p-2.5">
                            <p className="text-[10px] text-zinc-500 uppercase">Traffic shift</p>
                            <p className="text-lg font-bold text-zinc-100">{blastScenario.directImpact.trafficPct}%</p>
                          </div>
                        </div>
                      </div>

                      {/* Score gauge */}
                      <div className="flex flex-col items-center gap-2 shrink-0">
                        <div className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center ${
                          blastScenario.blastScore <= 40 ? "border-emerald-500 bg-emerald-950/30" :
                          blastScenario.blastScore <= 70 ? "border-amber-500 bg-amber-950/30" :
                          "border-red-500 bg-red-950/30"
                        }`}>
                          <span className={`text-3xl font-bold ${
                            blastScenario.blastScore <= 40 ? "text-emerald-400" :
                            blastScenario.blastScore <= 70 ? "text-amber-400" : "text-red-400"
                          }`}>{blastScenario.blastScore}</span>
                          <span className="text-[10px] text-zinc-500">BLAST SCORE</span>
                        </div>
                        <div className={`text-xs font-bold px-3 py-1.5 rounded border ${
                          blastScenario.eligible
                            ? "bg-emerald-900/40 text-emerald-300 border-emerald-700"
                            : "bg-red-900/40 text-red-300 border-red-700"
                        }`}>
                          {blastScenario.eligible ? "WITHIN LIMITS" : "EXCEEDS LIMITS"}
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-zinc-500">Approval path</p>
                          <p className="text-xs font-bold text-emerald-400">{blastScenario.approvalPath}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-zinc-500">Est. recovery</p>
                          <p className="text-xs font-bold text-zinc-300">{blastScenario.estimatedRecovery}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Dependency graph */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xs text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                        Downstream Dependencies
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {blastScenario.downstream.map(dep => (
                        <div key={dep.service} className="flex items-start gap-3 p-2.5 bg-zinc-800/50 rounded border border-zinc-800">
                          <div className={`mt-0.5 shrink-0 w-2 h-2 rounded-full ${
                            dep.risk === "HIGH" ? "bg-red-400" : dep.risk === "MEDIUM" ? "bg-amber-400" : "bg-emerald-400"
                          }`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-zinc-200">{dep.service}</span>
                              <span className={`text-[10px] font-bold ${riskColor[dep.risk]}`}>{dep.risk}</span>
                            </div>
                            <p className="text-[10px] text-zinc-500 mt-0.5">{dep.reason}</p>
                          </div>
                          <span className="text-[10px] text-zinc-500 shrink-0">{dep.users}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xs text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <ArrowRight className="w-3.5 h-3.5 text-zinc-500 rotate-180" />
                        Upstream Callers
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {blastScenario.upstream.map(dep => (
                        <div key={dep.service} className="flex items-start gap-3 p-2.5 bg-zinc-800/50 rounded border border-zinc-800">
                          <div className={`mt-0.5 shrink-0 w-2 h-2 rounded-full ${
                            dep.risk === "HIGH" ? "bg-red-400" : dep.risk === "MEDIUM" ? "bg-amber-400" : "bg-emerald-400"
                          }`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-zinc-200">{dep.service}</span>
                              <span className={`text-[10px] font-bold ${riskColor[dep.risk]}`}>{dep.risk}</span>
                            </div>
                            <p className="text-[10px] text-zinc-500 mt-0.5">{dep.reason}</p>
                          </div>
                          <span className="text-[10px] text-zinc-500 shrink-0">{dep.users}</span>
                        </div>
                      ))}
                      <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded text-[10px] text-emerald-400 flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                        Circuit breaker configured on all upstream callers. Automatic fallback if latency &gt; 500ms.
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* ── APPROVAL WORKFLOW TAB ── */}
            {activeTab === "workflow" && (
              <div className="space-y-4">
                {/* Approvers roster */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { role: "AUTO-EXECUTE", desc: "Agent acts without human gate", color: "emerald", icon: <Zap className="w-4 h-4 text-emerald-400" />, count: 3 },
                    { role: "ON-CALL SRE",  desc: "Primary on-call, 5-min SLA",    color: "amber",   icon: <Users className="w-4 h-4 text-amber-400" />, count: 2 },
                    { role: "LEAD SRE",     desc: "Senior escalation, 15-min SLA", color: "red",     icon: <ShieldAlert className="w-4 h-4 text-red-400" />, count: 2 },
                  ].map(a => (
                    <div key={a.role} className={`p-3 bg-zinc-900 rounded border border-zinc-800 flex items-center gap-3`}>
                      <div className="shrink-0">{a.icon}</div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-zinc-200">{a.role}</p>
                        <p className="text-[10px] text-zinc-500">{a.desc}</p>
                      </div>
                      <span className="text-xs text-zinc-400 font-bold">{a.count} rules</span>
                    </div>
                  ))}
                </div>

                {/* Rules table */}
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xs text-zinc-400 uppercase tracking-widest flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <GitBranch className="w-4 h-4 text-zinc-400" />
                        Approval Rules
                        <span className="text-[10px] bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded normal-case font-normal">
                          evaluated top-to-bottom, first match wins
                        </span>
                      </span>
                      <button className="flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 font-normal normal-case">
                        <Plus className="w-3 h-3" /> Add rule
                      </button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-0">
                      <div className="grid grid-cols-12 gap-2 px-3 py-2 text-[10px] text-zinc-600 uppercase tracking-wider border-b border-zinc-800">
                        <div className="col-span-1">#</div>
                        <div className="col-span-3">Action</div>
                        <div className="col-span-2">Service</div>
                        <div className="col-span-3">Condition</div>
                        <div className="col-span-2">Approval</div>
                        <div className="col-span-1">SLA</div>
                      </div>
                      {approvalRules.map((rule, idx) => (
                        <div
                          key={rule.id}
                          className={`grid grid-cols-12 gap-2 px-3 py-2.5 text-xs border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors group ${
                            idx === 0 ? "border-l-2 border-l-blue-600" : ""
                          }`}
                        >
                          <div className="col-span-1 text-zinc-600 flex items-center">
                            <span className="w-5 h-5 rounded bg-zinc-800 flex items-center justify-center text-[10px] font-bold">{idx + 1}</span>
                          </div>
                          <div className="col-span-3 text-zinc-300 flex items-center">{rule.action}</div>
                          <div className="col-span-2 flex items-center">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                              rule.service === "ALL" ? "bg-zinc-700 text-zinc-300" : "bg-zinc-800 text-zinc-400"
                            }`}>{rule.service === "ALL" ? "ALL" : rule.service.replace("-service","")}</span>
                          </div>
                          <div className="col-span-3 text-zinc-500 text-[11px] flex items-center">{rule.condition}</div>
                          <div className="col-span-2 flex items-center">
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${approvalBadgeStyle[rule.approval]}`}>
                              {rule.approval}
                            </span>
                          </div>
                          <div className="col-span-1 text-zinc-500 flex items-center justify-between">
                            <span>{rule.sla}</span>
                            <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 className="w-3 h-3 text-zinc-600 hover:text-red-400" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Time window overrides */}
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xs text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                      <Clock className="w-4 h-4 text-zinc-400" />
                      Time Window Overrides
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Business Hours", window: "Mon–Fri 09:00–18:00 UTC", policy: "Standard rules apply", active: true, icon: <Users className="w-4 h-4 text-blue-400" /> },
                        { label: "Night Window",   window: "Daily 00:00–06:00 UTC",    policy: "Auto-execute if conf ≥ 80%", active: true, icon: <Zap className="w-4 h-4 text-emerald-400" /> },
                        { label: "Freeze Window",  window: "Fri 22:00–Mon 06:00 UTC",  policy: "All actions require LEAD-SRE", active: false, icon: <Lock className="w-4 h-4 text-amber-400" /> },
                      ].map(w => (
                        <div key={w.label} className={`p-3 rounded border ${w.active ? "border-zinc-700 bg-zinc-800/40" : "border-zinc-800/50 bg-zinc-950/30 opacity-60"}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {w.icon}
                              <span className="text-xs font-bold text-zinc-200">{w.label}</span>
                            </div>
                            <div className={`w-7 h-4 rounded-full flex items-center px-0.5 cursor-pointer transition-colors ${w.active ? "bg-emerald-700 justify-end" : "bg-zinc-700 justify-start"}`}>
                              <div className="w-3 h-3 rounded-full bg-white" />
                            </div>
                          </div>
                          <p className="text-[10px] text-zinc-500 mb-1">{w.window}</p>
                          <p className="text-[10px] text-zinc-400">{w.policy}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

          </div>
        </div>

        {/* Right summary rail */}
        <div className="w-52 border-l border-zinc-800 flex flex-col shrink-0 p-4 gap-4">
          <div>
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-2">Policy Summary</p>
            <div className="space-y-2">
              {[
                { label: "Phase", value: services.find(s=>s.id===selectedService)?.phase, color: "text-blue-400" },
                { label: "Auto-exec rate", value: `${services.find(s=>s.id===selectedService)?.autoRate}%`, color: "text-emerald-400" },
                { label: "Blast budget", value: `${cfg.blastBudget}/100`, color: cfg.blastBudget <= 40 ? "text-emerald-400" : "text-amber-400" },
                { label: "Cooldown", value: `${cfg.cooldownSecs}s`, color: "text-zinc-300" },
                { label: "Approval req", value: cfg.requireApproval ? "YES" : "NO", color: cfg.requireApproval ? "text-amber-400" : "text-emerald-400" },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500">{item.label}</span>
                  <span className={`text-[10px] font-bold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator className="bg-zinc-800" />

          <div>
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-2">Unsaved Changes</p>
            <div className="space-y-1.5">
              {[
                "Blast budget +5 → 40",
                "Pod max: 2 → 3",
                "Night window OFF → ON",
              ].map(change => (
                <div key={change} className="text-[10px] text-amber-400 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  {change}
                </div>
              ))}
            </div>
          </div>

          <Separator className="bg-zinc-800" />

          <div>
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-2">Validation</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                <CheckCircle2 className="w-3 h-3" />
                Phase gate: PASS
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                <CheckCircle2 className="w-3 h-3" />
                Blast limits: PASS
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-amber-400">
                <AlertTriangle className="w-3 h-3" />
                No rollback rule
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                <CheckCircle2 className="w-3 h-3" />
                Freeze window: SET
              </div>
            </div>
          </div>

          <div className="mt-auto space-y-2">
            <button className="w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded transition-colors flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              SAVE POLICY
            </button>
            <button className="w-full px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs rounded transition-colors">
              DISCARD
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

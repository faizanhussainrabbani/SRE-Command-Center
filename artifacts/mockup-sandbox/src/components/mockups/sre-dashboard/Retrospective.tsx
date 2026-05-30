import React, { useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock,
  Database,
  FileText,
  GitMerge,
  Search,
  Server,
  ShieldAlert,
  Star,
  Tag,
  TrendingDown,
  TrendingUp,
  XCircle,
  Zap,
  BarChart2,
  Activity,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

/* ── Mock data ── */
const resolvedIncidents = [
  { id: "INC-2841", service: "api-gateway",        category: "latency",    duration: "00:03:22", outcome: "auto", confidence: 96, correct: true,  ts: "10:31Z" },
  { id: "INC-2838", service: "payments-service",   category: "crash-loop", duration: "00:07:51", outcome: "auto", confidence: 91, correct: true,  ts: "09:18Z" },
  { id: "INC-2835", service: "auth-service",       category: "cert-expiry",duration: "00:12:04", outcome: "human",confidence: 71, correct: true,  ts: "08:55Z" },
  { id: "INC-2831", service: "recommendation-engine",category:"memory",   duration: "00:02:10", outcome: "auto", confidence: 89, correct: false, ts: "07:43Z" },
  { id: "INC-2829", service: "notification-service",category:"throughput", duration: "00:01:48", outcome: "auto", confidence: 95, correct: true,  ts: "06:22Z" },
  { id: "INC-2824", service: "api-gateway",        category: "latency",    duration: "00:04:33", outcome: "auto", confidence: 93, correct: true,  ts: "05:10Z" },
  { id: "INC-2820", service: "payments-service",   category: "deployment", duration: "00:18:12", outcome: "human",confidence: 58, correct: true,  ts: "Yesterday" },
  { id: "INC-2814", service: "order-service",      category: "db-conn",    duration: "00:06:55", outcome: "auto", confidence: 82, correct: false, ts: "Yesterday" },
];

const ragEntries = [
  {
    id: "KB-0091",
    title: "OOMKilled crash loop — connection pool leak in payments-v2.3.x",
    sourceIncidents: ["INC-2847", "INC-2838", "INC-2801"],
    category: "crash-loop",
    similarity: 0.94,
    usageCount: 12,
    lastUsed: "2h ago",
    excerpt: "Memory usage consistently exceeds 2GB limit within 45–90 minutes of deployment. Root pattern: unbounded connection pool in postgres-client v3.2.x. Fix: apply resource limit patch to 4GB + connection pool max=50.",
    quality: 5,
    verified: true,
  },
  {
    id: "KB-0088",
    title: "api-gateway P99 latency spike — upstream connection exhaustion",
    sourceIncidents: ["INC-2846", "INC-2824", "INC-2771"],
    category: "latency",
    similarity: 0.89,
    usageCount: 8,
    lastUsed: "4h ago",
    excerpt: "Latency exceeds 800ms p99 under high load. Cause: upstream timeout not propagated, connections queue up. Fix: traffic shift 30% to replica pool + connection timeout tuning.",
    quality: 4,
    verified: true,
  },
  {
    id: "KB-0084",
    title: "Certificate expiry — auth-service TLS rotation pattern",
    sourceIncidents: ["INC-2835", "INC-2790"],
    category: "cert-expiry",
    similarity: 0.97,
    usageCount: 3,
    lastUsed: "6h ago",
    excerpt: "Cert expires within 4h window. Agent detects via Kubernetes events. Requires human approval for rotation. Average resolution: 12m. AutoRotate safe if confidence ≥ 85%.",
    quality: 5,
    verified: true,
  },
  {
    id: "KB-0079",
    title: "Deployment rollback — regression in recommendation-engine v4.x",
    sourceIncidents: ["INC-2820", "INC-2753"],
    category: "deployment",
    similarity: 0.81,
    usageCount: 5,
    lastUsed: "Yesterday",
    excerpt: "Memory anomaly score > 90 post-deploy. Correlates with v4.x model loading change. Safe rollback window: 30 minutes post-deploy before state divergence.",
    quality: 3,
    verified: false,
  },
  {
    id: "KB-0074",
    title: "DB connection pool exhaustion — order-service burst traffic",
    sourceIncidents: ["INC-2814", "INC-2768"],
    category: "db-conn",
    similarity: 0.76,
    usageCount: 4,
    lastUsed: "2d ago",
    excerpt: "Connection count exceeds 80% of pool max during flash sales. False positive rate high if signal is isolated without correlated traffic spike. Confidence threshold: 85%.",
    quality: 2,
    verified: false,
  },
];

const falsePositives = [
  {
    id: "INC-2831",
    service: "recommendation-engine",
    category: "memory",
    agentDiagnosis: "Memory leak — rolling restart recommended",
    actualCause: "Scheduled ML model warm-up (expected behaviour)",
    confidence: 89,
    reviewedBy: "alice@eng",
    reviewedAt: "07:58Z",
    impact: "Unnecessary restart, 23s downtime",
    lesson: "Add model warm-up schedule to agent context. Suppress alerts during warm-up window 06:00–07:00 UTC.",
    severity: "MEDIUM",
  },
  {
    id: "INC-2814",
    service: "order-service",
    category: "db-conn",
    agentDiagnosis: "Connection pool exhaustion — scale DB connections",
    actualCause: "Flash sale traffic spike — self-resolved in 90s",
    confidence: 82,
    reviewedBy: "bob@eng",
    reviewedAt: "Yesterday 14:32Z",
    impact: "No action taken, manual review delay 4m",
    lesson: "Integrate traffic spike event stream. Add 120s observation window before acting on connection exhaustion.",
    severity: "LOW",
  },
];

// Confidence calibration data — predicted vs actual accuracy
const calibrationData = [
  { bucket: "50–60%", predicted: 55, actual: 48, count: 8 },
  { bucket: "60–70%", predicted: 65, actual: 61, count: 14 },
  { bucket: "70–80%", predicted: 75, actual: 73, count: 22 },
  { bucket: "80–90%", predicted: 85, actual: 84, count: 41 },
  { bucket: "90–95%", predicted: 92, actual: 91, count: 67 },
  { bucket: "95–100%",predicted: 97, actual: 96, count: 38 },
];

// Accuracy trends by category — 4 weeks
const accuracyTrends: Record<string, number[]> = {
  "crash-loop":  [88, 90, 91, 94],
  "latency":     [92, 93, 95, 96],
  "deployment":  [74, 78, 82, 85],
  "memory":      [80, 81, 79, 83],
  "cert-expiry": [95, 96, 97, 97],
  "db-conn":     [71, 73, 76, 78],
};

const categoryColor: Record<string, string> = {
  "crash-loop":  "text-red-400 bg-red-900/30",
  "latency":     "text-amber-400 bg-amber-900/30",
  "deployment":  "text-blue-400 bg-blue-900/30",
  "memory":      "text-purple-400 bg-purple-900/30",
  "cert-expiry": "text-emerald-400 bg-emerald-900/30",
  "db-conn":     "text-orange-400 bg-orange-900/30",
  "throughput":  "text-cyan-400 bg-cyan-900/30",
};

/* ── Mini sparkline SVG ── */
function Sparkline({ values, color = "#4ade80", width = 80, height = 28 }: {
  values: number[]; color?: string; width?: number; height?: number;
}) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle
        cx={parseFloat(pts[pts.length - 1].split(",")[0])}
        cy={parseFloat(pts[pts.length - 1].split(",")[1])}
        r="2.5"
        fill={color}
      />
    </svg>
  );
}

/* ── Calibration bar pair ── */
function CalibBar({ predicted, actual, count }: { predicted: number; actual: number; count: number }) {
  const overconfident = predicted - actual;
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 h-4">
        <div className="h-4 bg-zinc-600/60 rounded-sm" style={{ width: `${predicted}%` }} />
      </div>
      <div className="flex items-center gap-1.5 h-4">
        <div
          className={`h-4 rounded-sm ${Math.abs(overconfident) <= 3 ? "bg-emerald-600" : overconfident > 3 ? "bg-amber-600" : "bg-blue-600"}`}
          style={{ width: `${actual}%` }}
        />
      </div>
      <div className="text-[10px] text-zinc-600 text-right">{count} inc</div>
    </div>
  );
}

/* ── Stars ── */
function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`w-2.5 h-2.5 ${i <= n ? "text-amber-400 fill-amber-400" : "text-zinc-700"}`} />
      ))}
    </div>
  );
}

export function Retrospective() {
  const [selectedIncident, setSelectedIncident] = useState("INC-2841");
  const [activeTab, setActiveTab] = useState<"rag" | "fp" | "calibration" | "trends">("rag");

  const fpRate = ((falsePositives.length / resolvedIncidents.length) * 100).toFixed(1);
  const autoResolvedPct = ((resolvedIncidents.filter(i => i.outcome === "auto").length / resolvedIncidents.length) * 100).toFixed(0);
  const correctPct = ((resolvedIncidents.filter(i => i.correct).length / resolvedIncidents.length) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-mono flex flex-col">

      {/* Header */}
      <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-50 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-500" />
            INCIDENT RETROSPECTIVE &amp; LEARNING
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">Post-incident analysis · RAG knowledge base · Confidence calibration</p>
        </div>
        <div className="flex items-center gap-6 text-xs">
          <div className="text-center">
            <p className="text-zinc-500 uppercase text-[10px]">Resolved (7d)</p>
            <p className="text-xl font-bold text-zinc-100">47</p>
          </div>
          <div className="text-center">
            <p className="text-zinc-500 uppercase text-[10px]">Auto-resolved</p>
            <p className="text-xl font-bold text-emerald-400">{autoResolvedPct}%</p>
          </div>
          <div className="text-center">
            <p className="text-zinc-500 uppercase text-[10px]">Correct diagnosis</p>
            <p className="text-xl font-bold text-emerald-400">{correctPct}%</p>
          </div>
          <div className="text-center">
            <p className="text-zinc-500 uppercase text-[10px]">False positive rate</p>
            <p className="text-xl font-bold text-amber-400">{fpRate}%</p>
          </div>
          <div className="text-center">
            <p className="text-zinc-500 uppercase text-[10px]">KB entries</p>
            <p className="text-xl font-bold text-blue-400">94</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* Left — incident list */}
        <div className="w-56 border-r border-zinc-800 flex flex-col shrink-0">
          <div className="px-4 py-2 border-b border-zinc-800 flex items-center justify-between">
            <span className="text-[10px] text-zinc-600 uppercase tracking-widest">Resolved (today)</span>
            <Filter className="w-3 h-3 text-zinc-600" />
          </div>
          <div className="flex flex-col gap-0.5 p-2 flex-1 overflow-y-auto">
            {resolvedIncidents.map(inc => (
              <button
                key={inc.id}
                onClick={() => setSelectedIncident(inc.id)}
                className={`w-full text-left px-2.5 py-2 rounded text-[11px] transition-colors flex flex-col gap-1 ${
                  selectedIncident === inc.id
                    ? "bg-zinc-800 border border-zinc-600"
                    : "hover:bg-zinc-900 border border-transparent"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-200">{inc.id}</span>
                  <span className="text-zinc-600 text-[9px]">{inc.ts}</span>
                </div>
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${categoryColor[inc.category] ?? "text-zinc-400 bg-zinc-800"}`}>
                    {inc.category}
                  </span>
                  <div className="flex items-center gap-1">
                    {inc.correct
                      ? <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      : <XCircle className="w-3 h-3 text-red-400" />
                    }
                    <span className={`text-[9px] font-bold ${inc.confidence >= 90 ? "text-emerald-400" : inc.confidence >= 75 ? "text-amber-400" : "text-red-400"}`}>
                      {inc.confidence}%
                    </span>
                  </div>
                </div>
                <div className="text-[9px] text-zinc-500 truncate">{inc.service}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Tabs */}
          <div className="border-b border-zinc-800 px-6 py-2 flex items-center gap-1">
            {([
              { key: "rag",         label: "RAG KNOWLEDGE BASE", icon: <Database className="w-3.5 h-3.5" /> },
              { key: "fp",          label: "FALSE POSITIVE REVIEW", icon: <ShieldAlert className="w-3.5 h-3.5" /> },
              { key: "calibration", label: "CONFIDENCE CALIBRATION", icon: <Activity className="w-3.5 h-3.5" /> },
              { key: "trends",      label: "ACCURACY TRENDS", icon: <BarChart2 className="w-3.5 h-3.5" /> },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded transition-colors ${
                  activeTab === tab.key
                    ? "bg-zinc-700 text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">

            {/* ── RAG KB TAB ── */}
            {activeTab === "rag" && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1 flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5">
                    <Search className="w-3.5 h-3.5 text-zinc-600" />
                    <span className="text-xs text-zinc-600">Search knowledge base... (94 entries)</span>
                  </div>
                  <div className="flex gap-1">
                    {["crash-loop","latency","deployment","memory"].map(cat => (
                      <span key={cat} className={`text-[10px] px-2 py-1 rounded cursor-pointer font-bold ${categoryColor[cat]}`}>{cat}</span>
                    ))}
                  </div>
                </div>

                {ragEntries.map(entry => (
                  <Card key={entry.id} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[10px] text-zinc-600 font-bold">{entry.id}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${categoryColor[entry.category] ?? "text-zinc-400 bg-zinc-800"}`}>
                              {entry.category}
                            </span>
                            {entry.verified && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-emerald-900/40 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                                <CheckCircle2 className="w-2.5 h-2.5" /> VERIFIED
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-bold text-zinc-200 mb-1.5">{entry.title}</p>
                          <p className="text-xs text-zinc-500 leading-relaxed">{entry.excerpt}</p>
                        </div>
                        <div className="shrink-0 flex flex-col items-end gap-2 min-w-[120px]">
                          <div className="text-right">
                            <p className="text-[10px] text-zinc-600">Similarity</p>
                            <p className={`text-base font-bold ${entry.similarity >= 0.9 ? "text-emerald-400" : entry.similarity >= 0.8 ? "text-amber-400" : "text-zinc-400"}`}>
                              {(entry.similarity * 100).toFixed(0)}%
                            </p>
                          </div>
                          <Stars n={entry.quality} />
                          <div className="text-right">
                            <p className="text-[10px] text-zinc-600">Used {entry.usageCount}× · {entry.lastUsed}</p>
                          </div>
                        </div>
                      </div>
                      <Separator className="bg-zinc-800 my-3" />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-zinc-600">Source incidents:</span>
                          {entry.sourceIncidents.map(id => (
                            <span key={id} className="text-[10px] px-1.5 py-0.5 bg-zinc-800 text-zinc-400 rounded font-bold">{id}</span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button className="text-[10px] text-zinc-500 hover:text-zinc-300 px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors">EDIT</button>
                          <button className="text-[10px] text-blue-400 hover:text-blue-300 px-2 py-1 rounded bg-blue-950/30 hover:bg-blue-950/50 border border-blue-900 transition-colors flex items-center gap-1">
                            <Zap className="w-2.5 h-2.5" /> PROMOTE
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* ── FALSE POSITIVE REVIEW TAB ── */}
            {activeTab === "fp" && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-4 flex items-center gap-3">
                      <XCircle className="w-8 h-8 text-amber-400 shrink-0" />
                      <div>
                        <p className="text-2xl font-bold text-zinc-100">2</p>
                        <p className="text-[10px] text-zinc-500 uppercase">False positives (today)</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-4 flex items-center gap-3">
                      <AlertTriangle className="w-8 h-8 text-amber-400 shrink-0" />
                      <div>
                        <p className="text-2xl font-bold text-zinc-100">3.1%</p>
                        <p className="text-[10px] text-zinc-500 uppercase">7-day FP rate (gate: &lt;5%)</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-4 flex items-center gap-3">
                      <Brain className="w-8 h-8 text-blue-400 shrink-0" />
                      <div>
                        <p className="text-2xl font-bold text-zinc-100">2</p>
                        <p className="text-[10px] text-zinc-500 uppercase">KB updates queued</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {falsePositives.map(fp => (
                  <Card key={fp.id} className="bg-zinc-900 border-zinc-800 border-l-2 border-l-amber-600">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-amber-400" />
                          <span className="text-sm font-bold text-zinc-100">{fp.id}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${categoryColor[fp.category] ?? ""}`}>{fp.category}</span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-amber-900/30 text-amber-400 border border-amber-800 rounded font-bold">FALSE POSITIVE</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                          <span>Reviewed by <span className="text-zinc-300">{fp.reviewedBy}</span></span>
                          <Clock className="w-3 h-3" />
                          <span>{fp.reviewedAt}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-red-950/20 border border-red-900/40 rounded p-3">
                          <p className="text-[10px] text-red-400 uppercase mb-1 font-bold">Agent Diagnosis (WRONG)</p>
                          <p className="text-xs text-zinc-300">{fp.agentDiagnosis}</p>
                          <p className="text-[10px] text-zinc-600 mt-1">Confidence: <span className={`font-bold ${fp.confidence >= 85 ? "text-amber-400" : "text-zinc-400"}`}>{fp.confidence}%</span></p>
                        </div>
                        <div className="bg-emerald-950/20 border border-emerald-900/40 rounded p-3">
                          <p className="text-[10px] text-emerald-400 uppercase mb-1 font-bold">Actual Cause</p>
                          <p className="text-xs text-zinc-300">{fp.actualCause}</p>
                          <p className="text-[10px] text-zinc-600 mt-1">Impact: <span className="text-zinc-400">{fp.impact}</span></p>
                        </div>
                      </div>

                      <div className="bg-blue-950/20 border border-blue-900/30 rounded p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Brain className="w-3 h-3 text-blue-400" />
                          <p className="text-[10px] text-blue-400 uppercase font-bold">Learning Applied</p>
                        </div>
                        <p className="text-xs text-zinc-300">{fp.lesson}</p>
                      </div>

                      <div className="flex justify-end gap-2">
                        <button className="text-[10px] px-2.5 py-1 bg-zinc-800 text-zinc-400 hover:bg-zinc-700 rounded transition-colors">DISMISS</button>
                        <button className="text-[10px] px-2.5 py-1 bg-blue-900/50 text-blue-300 hover:bg-blue-900 border border-blue-800 rounded transition-colors flex items-center gap-1">
                          <Database className="w-2.5 h-2.5" /> UPDATE KB
                        </button>
                        <button className="text-[10px] px-2.5 py-1 bg-emerald-900/50 text-emerald-300 hover:bg-emerald-900 border border-emerald-800 rounded transition-colors flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> APPLY RULE
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* ── CALIBRATION TAB ── */}
            {activeTab === "calibration" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Calibration chart */}
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <Activity className="w-4 h-4 text-blue-400" />
                        Confidence vs Actual Accuracy
                        <span className="text-[10px] bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded normal-case font-normal">last 30 days · 190 incidents</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4 text-[10px] text-zinc-500 mb-2">
                        <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded-sm bg-zinc-600/60" /> Predicted confidence</div>
                        <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded-sm bg-emerald-600" /> Actual accuracy</div>
                        <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded-sm bg-amber-600" /> Overconfident</div>
                      </div>
                      {calibrationData.map(row => (
                        <div key={row.bucket} className="grid grid-cols-[80px_1fr] gap-3 items-center">
                          <span className="text-[10px] text-zinc-500 text-right">{row.bucket}</span>
                          <div className="w-full max-w-full" style={{ maxWidth: "100%" }}>
                            <CalibBar predicted={row.predicted} actual={row.actual} count={row.count} />
                          </div>
                        </div>
                      ))}
                      <Separator className="bg-zinc-800 my-1" />
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-[10px] text-zinc-500">Calibration error</p>
                          <p className="text-sm font-bold text-emerald-400">2.3%</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-zinc-500">Brier score</p>
                          <p className="text-sm font-bold text-emerald-400">0.071</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-zinc-500">Overconf. rate</p>
                          <p className="text-sm font-bold text-amber-400">12.6%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Drift over time */}
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        Calibration Drift (30d)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Weekly ECE metric */}
                      {[
                        { week: "Week 1 (May 1–7)",   ece: 4.1, dir: "down" },
                        { week: "Week 2 (May 8–14)",  ece: 3.8, dir: "down" },
                        { week: "Week 3 (May 15–21)", ece: 3.2, dir: "down" },
                        { week: "Week 4 (May 22–28)", ece: 2.3, dir: "down" },
                      ].map(row => (
                        <div key={row.week} className="flex items-center gap-3">
                          <span className="text-[10px] text-zinc-500 w-36 shrink-0">{row.week}</span>
                          <div className="flex-1 bg-zinc-800 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-emerald-600 transition-all"
                              style={{ width: `${(row.ece / 5) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-emerald-400 w-10 text-right">{row.ece}%</span>
                          <TrendingDown className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        </div>
                      ))}
                      <Separator className="bg-zinc-800" />
                      <div className="bg-emerald-950/20 border border-emerald-900/30 rounded p-3 text-xs text-emerald-400 flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        ECE trending down — model calibration improving. 30-day improvement: 43.9%. No recalibration required.
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-zinc-800/40 rounded p-2.5">
                          <p className="text-[10px] text-zinc-500 mb-0.5">High-conf precision</p>
                          <p className="text-sm font-bold text-emerald-400">96.2%</p>
                          <p className="text-[9px] text-zinc-600">when agent says ≥90%</p>
                        </div>
                        <div className="bg-zinc-800/40 rounded p-2.5">
                          <p className="text-[10px] text-zinc-500 mb-0.5">Low-conf escalation</p>
                          <p className="text-sm font-bold text-amber-400">100%</p>
                          <p className="text-[9px] text-zinc-600">when agent says &lt;70%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* ── ACCURACY TRENDS TAB ── */}
            {activeTab === "trends" && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(accuracyTrends).map(([cat, values]) => {
                    const latest = values[values.length - 1];
                    const prev   = values[values.length - 2];
                    const delta  = latest - prev;
                    const color  = latest >= 90 ? "#4ade80" : latest >= 80 ? "#fbbf24" : "#f87171";
                    return (
                      <Card key={cat} className="bg-zinc-900 border-zinc-800">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${categoryColor[cat] ?? "text-zinc-400 bg-zinc-800"}`}>
                              {cat}
                            </span>
                            <span className="text-[10px] text-zinc-600">{values.reduce((a,b)=>a+b,0)} inc total</span>
                          </div>
                          <div className="flex items-end justify-between gap-2">
                            <div>
                              <p className="text-2xl font-bold" style={{ color }}>{latest}%</p>
                              <div className={`flex items-center gap-1 text-[10px] font-bold ${delta >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                {delta >= 0
                                  ? <TrendingUp className="w-3 h-3" />
                                  : <TrendingDown className="w-3 h-3" />
                                }
                                {delta >= 0 ? "+" : ""}{delta}pp vs last week
                              </div>
                            </div>
                            <Sparkline values={values} color={color} />
                          </div>
                          <div className="mt-3 space-y-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-zinc-600">4-week avg</span>
                              <span className="text-zinc-400 font-bold">
                                {(values.reduce((a,b)=>a+b,0)/values.length).toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-zinc-600">Peak</span>
                              <span className="text-zinc-400 font-bold">{Math.max(...values)}%</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Breakdown table */}
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                      <FileText className="w-4 h-4 text-zinc-400" />
                      Category Breakdown — Last 30 Days
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-8 gap-2 px-3 py-2 text-[10px] text-zinc-600 uppercase tracking-wider border-b border-zinc-800">
                      <div className="col-span-2">Category</div>
                      <div className="text-right">Total</div>
                      <div className="text-right">Auto</div>
                      <div className="text-right">TP</div>
                      <div className="text-right">FP</div>
                      <div className="text-right">FN</div>
                      <div className="text-right">Accuracy</div>
                    </div>
                    {[
                      { cat: "crash-loop",  total: 31, auto: 28, tp: 29, fp: 1, fn: 1 },
                      { cat: "latency",     total: 44, auto: 41, tp: 42, fp: 1, fn: 1 },
                      { cat: "deployment",  total: 18, auto: 13, tp: 15, fp: 2, fn: 1 },
                      { cat: "memory",      total: 22, auto: 17, tp: 18, fp: 2, fn: 2 },
                      { cat: "cert-expiry", total:  9, auto:  8, tp:  9, fp: 0, fn: 0 },
                      { cat: "db-conn",     total: 14, auto: 10, tp: 11, fp: 2, fn: 1 },
                      { cat: "throughput",  total:  8, auto:  7, tp:  7, fp: 1, fn: 0 },
                    ].map(row => {
                      const acc = ((row.tp / row.total) * 100).toFixed(1);
                      const accNum = parseFloat(acc);
                      return (
                        <div key={row.cat} className="grid grid-cols-8 gap-2 px-3 py-2.5 text-xs border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                          <div className="col-span-2 flex items-center">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${categoryColor[row.cat] ?? ""}`}>{row.cat}</span>
                          </div>
                          <div className="text-right text-zinc-400">{row.total}</div>
                          <div className="text-right text-zinc-400">{row.auto}</div>
                          <div className="text-right text-emerald-400 font-bold">{row.tp}</div>
                          <div className="text-right text-amber-400">{row.fp}</div>
                          <div className="text-right text-red-400">{row.fn}</div>
                          <div className={`text-right font-bold ${accNum >= 90 ? "text-emerald-400" : accNum >= 80 ? "text-amber-400" : "text-red-400"}`}>
                            {acc}%
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            )}

          </div>
        </div>

        {/* Right summary rail */}
        <div className="w-48 border-l border-zinc-800 flex flex-col shrink-0 p-4 gap-4">
          <div>
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-2">Learning Queue</p>
            <div className="space-y-2">
              {[
                { label: "KB updates ready",   value: "2", color: "text-amber-400" },
                { label: "FP rules pending",   value: "2", color: "text-amber-400" },
                { label: "Unverified entries", value: "2", color: "text-zinc-400" },
                { label: "KB total entries",   value: "94", color: "text-blue-400" },
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
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-2">Model Health</p>
            <div className="space-y-2">
              {[
                { label: "ECE (30d)",      value: "2.3%",  color: "text-emerald-400" },
                { label: "Brier score",    value: "0.071", color: "text-emerald-400" },
                { label: "FP rate (7d)",   value: "3.1%",  color: "text-emerald-400" },
                { label: "Recall",         value: "97.4%", color: "text-emerald-400" },
                { label: "Precision",      value: "96.2%", color: "text-emerald-400" },
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
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-2">Actions</p>
            <div className="space-y-2">
              <button className="w-full px-3 py-2 bg-blue-900/50 hover:bg-blue-900 text-blue-300 text-[10px] font-bold rounded border border-blue-800 transition-colors flex items-center justify-center gap-1">
                <Database className="w-3 h-3" /> APPLY KB UPDATES
              </button>
              <button className="w-full px-3 py-2 bg-emerald-900/50 hover:bg-emerald-900 text-emerald-300 text-[10px] font-bold rounded border border-emerald-800 transition-colors flex items-center justify-center gap-1">
                <Brain className="w-3 h-3" /> RETRAIN RULES
              </button>
              <button className="w-full px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-[10px] rounded transition-colors">
                EXPORT REPORT
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

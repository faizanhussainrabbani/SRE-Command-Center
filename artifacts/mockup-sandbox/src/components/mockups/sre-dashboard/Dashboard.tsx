import React from "react";
import { 
  Activity, 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  Lock, 
  Power, 
  Server, 
  ShieldAlert, 
  ShieldCheck, 
  Terminal
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

export function Dashboard() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 font-mono selection:bg-zinc-800">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* Header & KPI Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-50 flex items-center gap-2">
              <Terminal className="w-6 h-6 text-emerald-500" />
              AUTONOMOUS SRE COMMAND
            </h1>
            <p className="text-sm text-zinc-400 mt-1">SYS-OP-01 / REGION: US-EAST-1 / STATUS: ACTIVE</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-xs text-zinc-500 uppercase">MTTR (24H)</span>
              <span className="text-xl font-bold text-emerald-400">04m 12s</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-zinc-500 uppercase">Auto-Resolved</span>
              <span className="text-xl font-bold text-emerald-400">14</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-zinc-500 uppercase">Pending Approvals</span>
              <span className="text-xl font-bold text-amber-500">2</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-zinc-500 uppercase">Agent Accuracy (7D)</span>
              <span className="text-xl font-bold text-emerald-400">94.3%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Column - Incident Feed */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-zinc-900 border-zinc-800 rounded-sm rounded-tr-xl overflow-hidden">
              <CardHeader className="border-b border-zinc-800/50 pb-4">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex justify-between items-center">
                  <span>Live Incident Feed</span>
                  <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-400 bg-emerald-500/10">3 ACTIVE</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-zinc-800/50">
                  {/* Incident 1 */}
                  <div className="p-4 hover:bg-zinc-800/50 transition-colors border-l-2 border-red-500">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-0 rounded-sm px-2 py-0.5">CRITICAL</Badge>
                        <span className="font-bold text-zinc-200">INC-2847</span>
                        <span className="text-zinc-400 text-sm">payments-service pod crash loop (OOMKilled)</span>
                      </div>
                      <span className="text-xs text-zinc-500 flex items-center gap-1"><Clock className="w-3 h-3"/> 00:04:17</span>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-zinc-500 text-xs">PHASE:</span>
                        <div className="flex items-center gap-1">
                          <span className="text-zinc-600 line-through">Detecting</span> <span className="text-zinc-600 text-xs">→</span>
                          <span className="text-zinc-600 line-through">Diagnosing</span> <span className="text-zinc-600 text-xs">→</span>
                          <span className="text-amber-400 font-bold animate-pulse">Remediating (Awaiting Approval)</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-500">AI CONFIDENCE:</span>
                          <span className="text-sm text-emerald-400 font-bold">91.4%</span>
                        </div>
                        <button className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/30 px-3 py-1 rounded-sm text-xs font-bold transition-colors">
                          REVIEW ACTION
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Incident 2 */}
                  <div className="p-4 hover:bg-zinc-800/50 transition-colors border-l-2 border-amber-500">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-0 rounded-sm px-2 py-0.5">HIGH</Badge>
                        <span className="font-bold text-zinc-200">INC-2846</span>
                        <span className="text-zinc-400 text-sm">api-gateway latency spike 847ms p99</span>
                      </div>
                      <span className="text-xs text-zinc-500 flex items-center gap-1"><Clock className="w-3 h-3"/> 00:12:05</span>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-zinc-500 text-xs">PHASE:</span>
                        <div className="flex items-center gap-1">
                          <span className="text-zinc-600 line-through">Detecting</span> <span className="text-zinc-600 text-xs">→</span>
                          <span className="text-zinc-600 line-through">Diagnosing</span> <span className="text-zinc-600 text-xs">→</span>
                          <span className="text-zinc-600 line-through">Remediating</span> <span className="text-zinc-600 text-xs">→</span>
                          <span className="text-blue-400 font-bold">Verifying</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-500">AI CONFIDENCE:</span>
                          <span className="text-sm text-emerald-400 font-bold">96.8%</span>
                        </div>
                        <span className="text-xs text-zinc-500 border border-zinc-700 px-2 py-1 rounded-sm">AUTO-EXECUTING</span>
                      </div>
                    </div>
                  </div>

                  {/* Incident 3 */}
                  <div className="p-4 hover:bg-zinc-800/50 transition-colors border-l-2 border-blue-500">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-0 rounded-sm px-2 py-0.5">MEDIUM</Badge>
                        <span className="font-bold text-zinc-200">INC-2845</span>
                        <span className="text-zinc-400 text-sm">auth-service certificate expiry 2h</span>
                      </div>
                      <span className="text-xs text-zinc-500 flex items-center gap-1"><Clock className="w-3 h-3"/> 00:45:22</span>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-zinc-500 text-xs">PHASE:</span>
                        <div className="flex items-center gap-1">
                          <span className="text-blue-400 font-bold">Diagnosing</span> <span className="text-zinc-600 text-xs">→</span>
                          <span className="text-zinc-600">Remediating</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-500">AI CONFIDENCE:</span>
                          <span className="text-sm text-amber-400 font-bold">68.2%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800 rounded-sm">
              <CardHeader className="border-b border-zinc-800/50 pb-4">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-300">Recent Remediation Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-zinc-500 bg-zinc-950/50 uppercase border-b border-zinc-800/50">
                    <tr>
                      <th className="px-4 py-3 font-medium">Time</th>
                      <th className="px-4 py-3 font-medium">Resource</th>
                      <th className="px-4 py-3 font-medium">Action Type</th>
                      <th className="px-4 py-3 font-medium">Blast Radius</th>
                      <th className="px-4 py-3 font-medium text-right">Outcome</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    <tr className="hover:bg-zinc-800/30">
                      <td className="px-4 py-3 text-zinc-400">10:42:01Z</td>
                      <td className="px-4 py-3 text-zinc-300 font-medium">recommendation-db-read-replica</td>
                      <td className="px-4 py-3 text-zinc-400">Scale-up (Memory: 32G → 64G)</td>
                      <td className="px-4 py-3"><Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-[10px] rounded-sm py-0">LOW</Badge></td>
                      <td className="px-4 py-3 text-right"><span className="text-emerald-400 font-bold">SUCCESS</span></td>
                    </tr>
                    <tr className="hover:bg-zinc-800/30">
                      <td className="px-4 py-3 text-zinc-400">10:15:33Z</td>
                      <td className="px-4 py-3 text-zinc-300 font-medium">search-indexer-deployment</td>
                      <td className="px-4 py-3 text-zinc-400">Rollback (v2.4.1 → v2.4.0)</td>
                      <td className="px-4 py-3"><Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10 text-[10px] rounded-sm py-0">MED</Badge></td>
                      <td className="px-4 py-3 text-right"><span className="text-emerald-400 font-bold">SUCCESS</span></td>
                    </tr>
                    <tr className="hover:bg-zinc-800/30">
                      <td className="px-4 py-3 text-zinc-400">09:58:12Z</td>
                      <td className="px-4 py-3 text-zinc-300 font-medium">checkout-api-gateway</td>
                      <td className="px-4 py-3 text-zinc-400">Circuit-break (partner-api)</td>
                      <td className="px-4 py-3"><Badge variant="outline" className="border-red-500/30 text-red-400 bg-red-500/10 text-[10px] rounded-sm py-0">HIGH</Badge></td>
                      <td className="px-4 py-3 text-right"><span className="text-emerald-400 font-bold">SUCCESS</span></td>
                    </tr>
                    <tr className="hover:bg-zinc-800/30">
                      <td className="px-4 py-3 text-zinc-400">08:22:05Z</td>
                      <td className="px-4 py-3 text-zinc-300 font-medium">inventory-worker-nodes</td>
                      <td className="px-4 py-3 text-zinc-400">Pod restart (SIGTERM)</td>
                      <td className="px-4 py-3"><Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-[10px] rounded-sm py-0">LOW</Badge></td>
                      <td className="px-4 py-3 text-right"><span className="text-amber-500 font-bold">ROLLED-BACK</span></td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Status & Safety */}
          <div className="space-y-6">
            
            {/* Safety Guardrails */}
            <Card className="bg-zinc-900 border-zinc-800 rounded-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 blur-2xl rounded-full"></div>
              <CardHeader className="pb-3 border-b border-zinc-800/50">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Safety Guardrails
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex justify-between items-center bg-zinc-950 p-3 rounded-sm border border-zinc-800">
                  <div className="flex items-center gap-3">
                    <Power className="w-5 h-5 text-emerald-500" />
                    <div>
                      <div className="text-sm font-bold text-zinc-200">AGENT KILL SWITCH</div>
                      <div className="text-xs text-zinc-500">Autonomous actions enabled</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 bg-emerald-500/10 rounded-sm">ARMED</Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Phase Gate</span>
                    <span className="text-zinc-200 font-medium">ASSIST (Tier 2)</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Active Cooldowns</span>
                    <span className="text-emerald-400 font-medium">0/15</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Human Override Rate (24h)</span>
                    <span className="text-zinc-200 font-medium">4.2%</span>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-400">Blast Radius Budget</span>
                    <span className="text-amber-400 font-medium">45/100</span>
                  </div>
                  <Progress value={45} className="h-1.5 bg-zinc-800" indicatorClassName="bg-amber-500" />
                </div>
              </CardContent>
            </Card>

            {/* Provider Health */}
            <Card className="bg-zinc-900 border-zinc-800 rounded-sm">
              <CardHeader className="pb-3 border-b border-zinc-800/50">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  Telemetry Providers
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {[
                  { name: "AWS CloudWatch", status: "ok", latency: "14ms" },
                  { name: "Kubernetes OTel", status: "ok", latency: "8ms" },
                  { name: "Azure Monitor", status: "ok", latency: "22ms" },
                  { name: "Prometheus", status: "ok", latency: "4ms" },
                  { name: "NewRelic", status: "degraded", latency: "840ms" },
                  { name: "Datadog", status: "ok", latency: "18ms" },
                ].map(provider => (
                  <div key={provider.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {provider.status === "ok" ? 
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : 
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      }
                      <span className={`text-sm ${provider.status === "ok" ? "text-zinc-300" : "text-amber-500 font-medium"}`}>
                        {provider.name}
                      </span>
                    </div>
                    <span className="text-xs text-zinc-500 font-mono">{provider.latency}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            
            {/* Active Action Locks */}
            <Card className="bg-zinc-900 border-zinc-800 rounded-sm">
              <CardHeader className="pb-3 border-b border-zinc-800/50">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-zinc-400" />
                  Active Action Locks
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3 bg-zinc-950 p-3 rounded-sm border border-zinc-800 border-l-2 border-l-blue-500">
                  <Activity className="w-4 h-4 text-blue-500 mt-0.5" />
                  <div>
                    <div className="text-sm text-zinc-200 font-medium">us-east-1-networking</div>
                    <div className="text-xs text-zinc-500 mt-1">Locked by: Agent-Replica-2</div>
                    <div className="text-xs text-zinc-500">Duration: 00:02:14</div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}

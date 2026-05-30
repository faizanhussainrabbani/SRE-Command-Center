import React from "react";
import { 
  Activity, 
  AlertTriangle, 
  ArrowUpRight, 
  Brain, 
  CheckCircle2, 
  ChevronRight, 
  Clock, 
  Cpu, 
  Database, 
  GitMerge, 
  HardDrive, 
  Key, 
  Lock, 
  Code, 
  Network, 
  Server, 
  ShieldCheck, 
  Terminal, 
  TrendingUp,
  GitBranch
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

export function AgentStatus() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 font-mono selection:bg-zinc-800">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-50 flex items-center gap-2">
              <Brain className="w-6 h-6 text-emerald-500" />
              AGENT HEALTH & GRADUATION
            </h1>
            <p className="text-sm text-zinc-400 mt-1">Autonomous Operations Controller Status</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-sm font-bold text-emerald-500">SYSTEM HEALTHY</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-zinc-500 uppercase">Uptime</span>
              <span className="text-sm font-bold text-zinc-300">45d 12h 04m</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-zinc-500 uppercase">Active Replicas</span>
              <span className="text-sm font-bold text-emerald-400">3/3</span>
            </div>
          </div>
        </div>

        {/* Graduation Gate Tracker */}
        <Card className="bg-zinc-900 border-zinc-800 rounded-sm">
          <CardHeader className="pb-3 border-b border-zinc-800/50">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Autonomous Graduation Gates
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="relative">
              {/* Connecting line */}
              <div className="absolute top-6 left-[10%] right-[10%] h-1 bg-zinc-800 -z-10 rounded-full">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '40%' }}></div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                {/* Phase 1 */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-zinc-950 border-2 border-emerald-500 flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  </div>
                  <h3 className="font-bold text-zinc-200">Phase 1: OBSERVE</h3>
                  <Badge variant="outline" className="mt-2 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">COMPLETED</Badge>
                  <p className="text-xs text-zinc-500 mt-2">Shadow mode. No actions taken.<br/>30/30 days completed.</p>
                </div>

                {/* Phase 2 */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-zinc-950 border-2 border-blue-500 flex items-center justify-center mb-3 ring-4 ring-blue-500/10">
                    <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                  <h3 className="font-bold text-zinc-200">Phase 2: ASSIST</h3>
                  <Badge variant="outline" className="mt-2 bg-blue-500/10 text-blue-400 border-blue-500/30">CURRENT (18/30 DAYS)</Badge>
                  
                  <div className="mt-4 w-full max-w-[200px] text-left space-y-3 bg-zinc-950 p-3 rounded-sm border border-zinc-800">
                    <div>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-zinc-400">Accuracy {'>'} 90%</span>
                        <span className="text-emerald-400 font-bold">94.3% ✓</span>
                      </div>
                      <Progress value={94.3} className="h-1 bg-zinc-800" indicatorClassName="bg-emerald-500" />
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-zinc-400">Human Override {'<'} 15%</span>
                        <span className="text-emerald-400 font-bold">8.2% ✓</span>
                      </div>
                      <Progress value={8.2} className="h-1 bg-zinc-800" indicatorClassName="bg-emerald-500" />
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-zinc-400">False Positives {'<'} 5%</span>
                        <span className="text-emerald-400 font-bold">3.1% ✓</span>
                      </div>
                      <Progress value={3.1} className="h-1 bg-zinc-800" indicatorClassName="bg-emerald-500" />
                    </div>
                  </div>
                </div>

                {/* Phase 3 */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-zinc-950 border-2 border-zinc-800 flex items-center justify-center mb-3">
                    <Lock className="w-5 h-5 text-zinc-600" />
                  </div>
                  <h3 className="font-bold text-zinc-500">Phase 3: AUTOMATE</h3>
                  <Badge variant="outline" className="mt-2 bg-zinc-900 text-zinc-500 border-zinc-800">LOCKED</Badge>
                  <p className="text-xs text-zinc-600 mt-2">Full autonomy with defined<br/>blast radius budgets.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column */}
          <div className="space-y-6">
            
            {/* Diagnostic Accuracy */}
            <Card className="bg-zinc-900 border-zinc-800 rounded-sm">
              <CardHeader className="pb-3 border-b border-zinc-800/50">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  Diagnostic Accuracy
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-6">
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-zinc-950 border border-zinc-800 p-2 rounded-sm text-center">
                    <div className="text-[10px] text-zinc-500 uppercase mb-1">7 Days</div>
                    <div className="text-lg font-bold text-emerald-400">96.2%</div>
                  </div>
                  <div className="bg-zinc-950 border border-zinc-800 p-2 rounded-sm text-center">
                    <div className="text-[10px] text-zinc-500 uppercase mb-1">30 Days</div>
                    <div className="text-lg font-bold text-emerald-500">94.3%</div>
                  </div>
                  <div className="bg-zinc-950 border border-zinc-800 p-2 rounded-sm text-center">
                    <div className="text-[10px] text-zinc-500 uppercase mb-1">90 Days</div>
                    <div className="text-lg font-bold text-zinc-300">89.1%</div>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center border-b border-zinc-800/50 pb-2">
                    <span className="text-zinc-400">Precision</span>
                    <span className="text-emerald-400 font-bold">0.96</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-zinc-800/50 pb-2">
                    <span className="text-zinc-400">Recall</span>
                    <span className="text-emerald-400 font-bold">0.92</span>
                  </div>
                  <div className="flex justify-between items-center pb-2">
                    <span className="text-zinc-400">F1 Score</span>
                    <span className="text-emerald-400 font-bold">0.94</span>
                  </div>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-sm">
                  <h4 className="text-xs font-bold text-zinc-500 mb-2">LAST 30 DAYS MATRIX</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-sm flex justify-between">
                      <span className="text-emerald-500/70">True Pos</span>
                      <span className="text-emerald-400 font-bold">412</span>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 p-2 rounded-sm flex justify-between">
                      <span className="text-amber-500/70">False Pos</span>
                      <span className="text-amber-400 font-bold">14</span>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 p-2 rounded-sm flex justify-between">
                      <span className="text-amber-500/70">False Neg</span>
                      <span className="text-amber-400 font-bold">11</span>
                    </div>
                    <div className="bg-zinc-800/30 border border-zinc-800 p-2 rounded-sm flex justify-between">
                      <span className="text-zinc-500">True Neg</span>
                      <span className="text-zinc-300 font-bold">—</span>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* LLM Performance */}
            <Card className="bg-zinc-900 border-zinc-800 rounded-sm">
              <CardHeader className="pb-3 border-b border-zinc-800/50">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                  <Code className="w-4 h-4 text-purple-400" />
                  LLM Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">Primary Model</span>
                  <Badge variant="outline" className="border-purple-500/30 text-purple-400 bg-purple-500/10 text-xs rounded-sm">Claude 3.5 Sonnet</Badge>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-400">Avg Inference Latency</span>
                      <span className="text-zinc-200 font-medium">1.2s</span>
                    </div>
                    <Progress value={20} className="h-1 bg-zinc-800" indicatorClassName="bg-purple-500" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-400">Token Usage (24h)</span>
                      <span className="text-zinc-200 font-medium">4.2M / 10M Limit</span>
                    </div>
                    <Progress value={42} className="h-1 bg-zinc-800" indicatorClassName="bg-purple-500" />
                  </div>
                </div>

                <div className="flex items-center justify-between bg-zinc-950 p-2 rounded-sm border border-zinc-800 text-xs">
                  <span className="text-zinc-500">Throttle Events (1h)</span>
                  <span className="text-emerald-400 font-bold">0</span>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Middle Column */}
          <div className="space-y-6">
            
            {/* Agent Coordination */}
            <Card className="bg-zinc-900 border-zinc-800 rounded-sm">
              <CardHeader className="pb-3 border-b border-zinc-800/50">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                  <Network className="w-4 h-4 text-blue-400" />
                  Agent Coordination
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                
                {/* Replicas */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-zinc-500 mb-2">REPLICA STATUS</h4>
                  
                  <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 p-2 rounded-sm border-l-2 border-l-blue-500">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-zinc-400" />
                      <span className="text-sm text-zinc-200 font-medium">agent-primary-0</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10 text-[10px] py-0 rounded-sm">LEADER</Badge>
                      <span className="text-xs text-zinc-500 font-mono">12ms ago</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 p-2 rounded-sm">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-zinc-600" />
                      <span className="text-sm text-zinc-400 font-medium">agent-replica-1</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-zinc-500">FOLLOWER</span>
                      <span className="text-xs text-zinc-500 font-mono">45ms ago</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 p-2 rounded-sm">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-zinc-600" />
                      <span className="text-sm text-zinc-400 font-medium">agent-replica-2</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-zinc-500">FOLLOWER</span>
                      <span className="text-xs text-zinc-500 font-mono">18ms ago</span>
                    </div>
                  </div>
                </div>

                <Separator className="bg-zinc-800/50" />

                {/* Infrastructure */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-zinc-500" />
                      <span className="text-zinc-400">etcd Lock Status</span>
                    </div>
                    <span className="text-emerald-400 font-mono text-xs">agent-primary-0</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-zinc-500" />
                      <span className="text-zinc-400">Redis Event Bus</span>
                    </div>
                    <span className="text-emerald-400 flex items-center gap-1 text-xs"><CheckCircle2 className="w-3 h-3" /> HEALTHY</span>
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Telemetry Provider Health */}
            <Card className="bg-zinc-900 border-zinc-800 rounded-sm">
              <CardHeader className="pb-3 border-b border-zinc-800/50">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-zinc-400" />
                  Telemetry Providers
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 p-0">
                <table className="w-full text-sm text-left">
                  <thead className="text-[10px] text-zinc-500 bg-zinc-950/50 uppercase border-b border-zinc-800/50">
                    <tr>
                      <th className="px-4 py-2 font-medium">Provider</th>
                      <th className="px-4 py-2 font-medium text-right">Ingest Rate</th>
                      <th className="px-4 py-2 font-medium text-right">Last Event</th>
                      <th className="px-4 py-2 font-medium text-right">Error %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50 text-xs">
                    <tr className="hover:bg-zinc-800/30">
                      <td className="px-4 py-2.5 text-zinc-300 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Datadog
                      </td>
                      <td className="px-4 py-2.5 text-right text-zinc-400 font-mono">1.2k/s</td>
                      <td className="px-4 py-2.5 text-right text-zinc-500 font-mono">2ms</td>
                      <td className="px-4 py-2.5 text-right text-emerald-400 font-mono">0.01%</td>
                    </tr>
                    <tr className="hover:bg-zinc-800/30">
                      <td className="px-4 py-2.5 text-zinc-300 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Prometheus
                      </td>
                      <td className="px-4 py-2.5 text-right text-zinc-400 font-mono">450/s</td>
                      <td className="px-4 py-2.5 text-right text-zinc-500 font-mono">1s</td>
                      <td className="px-4 py-2.5 text-right text-emerald-400 font-mono">0.00%</td>
                    </tr>
                    <tr className="hover:bg-zinc-800/30">
                      <td className="px-4 py-2.5 text-zinc-300 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> NewRelic
                      </td>
                      <td className="px-4 py-2.5 text-right text-zinc-400 font-mono">82/s</td>
                      <td className="px-4 py-2.5 text-right text-amber-500 font-mono">45s</td>
                      <td className="px-4 py-2.5 text-right text-amber-500 font-mono">4.20%</td>
                    </tr>
                    <tr className="hover:bg-zinc-800/30">
                      <td className="px-4 py-2.5 text-zinc-300 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> AWS CloudWatch
                      </td>
                      <td className="px-4 py-2.5 text-right text-zinc-400 font-mono">3.4k/s</td>
                      <td className="px-4 py-2.5 text-right text-zinc-500 font-mono">5s</td>
                      <td className="px-4 py-2.5 text-right text-emerald-400 font-mono">0.05%</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>

          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Recent Agent Decisions */}
            <Card className="bg-zinc-900 border-zinc-800 rounded-sm h-full">
              <CardHeader className="pb-3 border-b border-zinc-800/50 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                  <GitMerge className="w-4 h-4 text-zinc-400" />
                  Recent Autonomous Decisions
                </CardTitle>
                <Badge variant="outline" className="text-zinc-500 border-zinc-700 rounded-sm text-[10px]">LAST 24H</Badge>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-zinc-800/50">
                  
                  <div className="p-4 hover:bg-zinc-800/30 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border-0 rounded-sm px-1.5 py-0 text-[10px]">SCALE</Badge>
                        <span className="font-bold text-zinc-200 text-sm">recommendation-db-read</span>
                      </div>
                      <span className="text-xs text-zinc-500 font-mono">10:42:01Z</span>
                    </div>
                    <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
                      Memory usage sustained &gt;85% for 10m. Scaled from 32G to 64G.
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-emerald-400">
                        <Brain className="w-3 h-3" />
                        <span>Conf: 98%</span>
                      </div>
                      <span className="text-emerald-500 font-bold">SUCCESS</span>
                    </div>
                  </div>

                  <div className="p-4 hover:bg-zinc-800/30 transition-colors border-l-2 border-l-amber-500">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border-0 rounded-sm px-1.5 py-0 text-[10px]">ROLLBACK</Badge>
                        <span className="font-bold text-zinc-200 text-sm">search-indexer-deployment</span>
                      </div>
                      <span className="text-xs text-zinc-500 font-mono">10:15:33Z</span>
                    </div>
                    <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
                      Error rate spiked to 12% post-deployment. Reverted to v2.4.0.
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-emerald-400">
                        <Brain className="w-3 h-3" />
                        <span>Conf: 94%</span>
                      </div>
                      <span className="text-emerald-500 font-bold">SUCCESS</span>
                    </div>
                  </div>

                  <div className="p-4 hover:bg-zinc-800/30 transition-colors border-l-2 border-l-blue-500">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border-0 rounded-sm px-1.5 py-0 text-[10px]">CIRCUIT-BREAK</Badge>
                        <span className="font-bold text-zinc-200 text-sm">checkout-api-gateway</span>
                      </div>
                      <span className="text-xs text-zinc-500 font-mono">09:58:12Z</span>
                    </div>
                    <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
                      partner-api degraded (p99 4s). Tripped circuit breaker to prevent cascading failure.
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-emerald-400">
                        <Brain className="w-3 h-3" />
                        <span>Conf: 91%</span>
                      </div>
                      <span className="text-emerald-500 font-bold">SUCCESS</span>
                    </div>
                  </div>

                  <div className="p-4 hover:bg-zinc-800/30 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border-0 rounded-sm px-1.5 py-0 text-[10px]">RESTART</Badge>
                        <span className="font-bold text-zinc-200 text-sm">inventory-worker-nodes</span>
                      </div>
                      <span className="text-xs text-zinc-500 font-mono">08:22:05Z</span>
                    </div>
                    <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
                      Deadlock detected in worker pool. Issued SIGTERM.
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-amber-400">
                        <Brain className="w-3 h-3" />
                        <span>Conf: 82%</span>
                      </div>
                      <span className="text-amber-500 font-bold">ROLLED-BACK</span>
                    </div>
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

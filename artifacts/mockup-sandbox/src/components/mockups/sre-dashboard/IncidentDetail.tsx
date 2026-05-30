import React from "react";
import { 
  Activity, 
  AlertTriangle, 
  ArrowLeft, 
  ArrowRight, 
  Brain, 
  CheckCircle2, 
  ChevronRight, 
  Clock, 
  Database, 
  FileText, 
  Gauge, 
  Network, 
  Play, 
  Search, 
  Server, 
  ShieldAlert, 
  Terminal, 
  XCircle,
  RefreshCcw,
  Timer,
  ShieldCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

export function IncidentDetail() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 font-mono selection:bg-zinc-800">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-4">
            <button className="text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1 text-sm font-bold">
              <ArrowLeft className="w-4 h-4" />
              BACK TO FEED
            </button>
            <div className="h-4 w-px bg-zinc-800"></div>
            <div className="flex items-center gap-3">
              <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-0 rounded-sm px-2 py-0.5 text-sm">CRITICAL</Badge>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-50">INC-2847</h1>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 uppercase">Detection Source</span>
              <span className="text-sm font-bold text-zinc-300 flex items-center gap-1"><Activity className="w-4 h-4 text-blue-400" /> Kubernetes OTel</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 uppercase">Duration</span>
              <span className="text-sm font-bold text-amber-500 flex items-center gap-1"><Clock className="w-4 h-4" /> 00:04:17</span>
            </div>
          </div>
        </div>

        {/* Incident Summary */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-sm">
          <h2 className="text-xl font-bold text-zinc-200 mb-2">payments-service OOMKilled crash loop — pods cycling every 23s</h2>
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center gap-2 bg-zinc-950 px-3 py-1.5 rounded-sm border border-zinc-800">
              <Server className="w-4 h-4 text-zinc-400" />
              <span className="text-xs text-zinc-500">Service:</span>
              <span className="text-sm font-bold text-zinc-300">payments-service</span>
            </div>
            <div className="flex items-center gap-2 bg-zinc-950 px-3 py-1.5 rounded-sm border border-zinc-800">
              <Database className="w-4 h-4 text-zinc-400" />
              <span className="text-xs text-zinc-500">Affected:</span>
              <span className="text-sm font-bold text-amber-400">3 pods, 2 nodes</span>
            </div>
            <div className="flex items-center gap-2 bg-zinc-950 px-3 py-1.5 rounded-sm border border-zinc-800">
              <Network className="w-4 h-4 text-zinc-400" />
              <span className="text-xs text-zinc-500">Environment:</span>
              <span className="text-sm font-bold text-zinc-300">k8s-prod-cluster-1</span>
            </div>
          </div>

          {/* Phase Indicator */}
          <div className="mt-8 border-t border-zinc-800 pt-6">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-zinc-800 z-0"></div>
              
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <span className="text-xs font-bold text-emerald-500">Detecting</span>
              </div>
              
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <span className="text-xs font-bold text-emerald-500">Diagnosing</span>
              </div>

              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center ring-4 ring-amber-500/10">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                </div>
                <span className="text-xs font-bold text-amber-500">Remediating</span>
              </div>

              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-700"></div>
                </div>
                <span className="text-xs font-bold text-zinc-600">Verifying</span>
              </div>

              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-700"></div>
                </div>
                <span className="text-xs font-bold text-zinc-600">Resolved</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Column - Trace & Remediation */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* AI Reasoning Trace */}
            <Card className="bg-zinc-900 border-zinc-800 rounded-sm">
              <CardHeader className="border-b border-zinc-800/50 pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-emerald-500" />
                  Diagnostic Pipeline Trace
                </CardTitle>
                <Badge variant="outline" className="border-zinc-700 text-zinc-400 bg-zinc-950 rounded-sm">RAG PIPELINE</Badge>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[320px] overflow-y-auto p-4 space-y-3 font-mono text-sm">
                  
                  <div className="flex items-start gap-3">
                    <span className="text-zinc-600 w-20 shrink-0">00:00:02</span>
                    <Search className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <span className="text-zinc-300">Fetching pod logs from <span className="text-blue-400">k8s-prod-cluster-1...</span></span>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <span className="text-zinc-600 w-20 shrink-0">00:00:05</span>
                    <Terminal className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-zinc-300">Metrics analyzed. Memory usage: </span>
                      <span className="text-red-400 font-bold">1.97GB / 2GB limit (98.5%)</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-zinc-600 w-20 shrink-0">00:00:12</span>
                    <Activity className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-zinc-300">Correlating with recent deployments... found <span className="text-emerald-400">payments-v2.3.1</span> deployed 18m ago</span>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-zinc-600 w-20 shrink-0">00:00:15</span>
                    <Database className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <span className="text-zinc-300">Retrieving similar incidents from vector DB... 3 matches found (similarity: <span className="text-emerald-400">0.94</span>)</span>
                  </div>

                  <div className="flex items-start gap-3 bg-zinc-800/30 p-2 -mx-2 rounded-sm border-l-2 border-emerald-500">
                    <span className="text-zinc-600 w-16 shrink-0">00:00:19</span>
                    <Brain className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-emerald-400 font-bold">Root cause hypothesis:</span>
                      <span className="text-zinc-300"> Memory leak in payments-v2.3.1 connection pool (confidence: 91.4%)</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-zinc-600 w-20 shrink-0">00:00:22</span>
                    <FileText className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span className="text-zinc-300">Proposed action: rolling restart with resource limit patch (2GB → 4GB)</span>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-zinc-600 w-20 shrink-0">00:00:24</span>
                    <ShieldAlert className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-zinc-300">Safety check: blast radius LOW — 3 pods, no downstream dependencies blocked</span>
                  </div>

                </div>
              </CardContent>
            </Card>

            {/* Proposed Remediation */}
            <Card className="bg-zinc-900 border-zinc-800 rounded-sm overflow-hidden border-l-4 border-l-amber-500">
              <CardHeader className="pb-3 border-b border-zinc-800/50 bg-amber-500/5">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RefreshCcw className="w-4 h-4 text-amber-500" />
                    Proposed Remediation Plan
                  </div>
                  <Badge variant="outline" className="border-amber-500/50 text-amber-500 bg-amber-500/10 rounded-sm text-xs">AWAITING APPROVAL</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-6">
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-sm">
                    <span className="text-zinc-500 block text-xs mb-1">Expected Recovery Time</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1"><Timer className="w-4 h-4" /> ~45 seconds</span>
                  </div>
                  <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-sm">
                    <span className="text-zinc-500 block text-xs mb-1">Estimated Blast Radius</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1"><ShieldCheck className="w-4 h-4" /> LOW (3 pods affected)</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-zinc-500 uppercase mb-3">Execution Steps</h3>
                  <div className="space-y-3 relative">
                    <div className="absolute left-3 top-2 bottom-2 w-px bg-zinc-800"></div>
                    
                    <div className="flex gap-3 relative z-10">
                      <div className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center shrink-0 text-xs text-zinc-400 font-bold">1</div>
                      <div>
                        <div className="text-sm font-bold text-zinc-200">Patch Deployment Resource Limits</div>
                        <div className="text-xs text-zinc-400 mt-1 font-mono bg-zinc-950 p-2 rounded-sm border border-zinc-800">kubectl patch deployment payments-service -p '{"{"}"spec":{"{"}template":{"{"}spec":{"{"}containers":[... memory: "4Gi" ...]</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 relative z-10">
                      <div className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center shrink-0 text-xs text-zinc-400 font-bold">2</div>
                      <div>
                        <div className="text-sm font-bold text-zinc-200">Initiate Rolling Restart</div>
                        <div className="text-xs text-zinc-400 mt-1">Gracefully terminate existing pods and spin up new ones with updated limits.</div>
                      </div>
                    </div>

                    <div className="flex gap-3 relative z-10">
                      <div className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center shrink-0 text-xs text-zinc-400 font-bold">3</div>
                      <div>
                        <div className="text-sm font-bold text-zinc-200">Verify Health Checks</div>
                        <div className="text-xs text-zinc-400 mt-1">Monitor /healthz endpoint for 30s before marking resolved.</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-sm">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase mb-1">Rollback Plan</h3>
                  <span className="text-sm text-zinc-300">Revert deployment to previous state via standard Helm rollback if health checks fail.</span>
                </div>

              </CardContent>
            </Card>
          </div>

          {/* Right Column - Confidence & Approval & Timeline */}
          <div className="space-y-6">
            
            {/* Approval Panel */}
            <Card className="bg-zinc-900 border-zinc-800 rounded-sm relative overflow-hidden ring-1 ring-amber-500/50">
              <div className="absolute top-0 right-0 w-full h-1 bg-amber-500"></div>
              <CardContent className="pt-6 pb-6 space-y-4">
                <div className="text-center">
                  <div className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">Human Approval Required</div>
                  <div className="text-3xl font-bold text-zinc-100 font-mono tracking-tight">04:43</div>
                  <div className="text-xs text-zinc-500 mt-1">Before auto-fallback to safe state</div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 py-3 rounded-sm text-sm font-bold transition-colors flex items-center justify-center gap-2">
                    <XCircle className="w-4 h-4" /> REJECT
                  </button>
                  <button className="bg-amber-500 hover:bg-amber-400 text-zinc-950 py-3 rounded-sm text-sm font-bold transition-colors flex items-center justify-center gap-2">
                    <Play className="w-4 h-4" /> EXECUTE
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Confidence Gauge */}
            <Card className="bg-zinc-900 border-zinc-800 rounded-sm">
              <CardHeader className="pb-2 border-b border-zinc-800/50">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-emerald-500" />
                  AI Confidence Score
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="flex items-end gap-3 justify-center">
                  <span className="text-5xl font-bold text-emerald-400 tracking-tighter leading-none">91.4</span>
                  <span className="text-xl font-bold text-zinc-500 mb-1">%</span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-400">Telemetry Richness</span>
                      <span className="text-emerald-400 font-bold">98%</span>
                    </div>
                    <Progress value={98} className="h-1.5 bg-zinc-800" indicatorClassName="bg-emerald-500" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-400">Historical Match Quality</span>
                      <span className="text-emerald-400 font-bold">94%</span>
                    </div>
                    <Progress value={94} className="h-1.5 bg-zinc-800" indicatorClassName="bg-emerald-500" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-400">Diagnosis Consistency</span>
                      <span className="text-amber-400 font-bold">82%</span>
                    </div>
                    <Progress value={82} className="h-1.5 bg-zinc-800" indicatorClassName="bg-amber-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Incident Timeline */}
            <Card className="bg-zinc-900 border-zinc-800 rounded-sm">
              <CardHeader className="pb-3 border-b border-zinc-800/50">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-zinc-400" />
                  Event Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4 text-sm relative before:absolute before:inset-0 before:ml-1 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-zinc-800">
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-3 h-3 rounded-full border border-red-500 bg-red-500/20 text-red-500 group-[.is-active]:text-red-100 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2"></div>
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] pl-4 md:pl-0 md:group-odd:text-right">
                      <div className="flex flex-col md:group-odd:items-end">
                        <span className="text-zinc-200 font-bold text-xs">Alert Triggered</span>
                        <span className="text-zinc-500 text-[10px] font-mono">10:45:12Z</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className="flex items-center justify-center w-3 h-3 rounded-full border border-emerald-500 bg-emerald-500/20 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2"></div>
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] pl-4 md:pl-0 md:group-odd:text-right">
                      <div className="flex flex-col md:group-odd:items-end">
                        <span className="text-zinc-200 font-bold text-xs">Agent Acknowledged</span>
                        <span className="text-zinc-500 text-[10px] font-mono">10:45:14Z</span>
                      </div>
                    </div>
                  </div>

                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className="flex items-center justify-center w-3 h-3 rounded-full border border-emerald-500 bg-emerald-500/20 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2"></div>
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] pl-4 md:pl-0 md:group-odd:text-right">
                      <div className="flex flex-col md:group-odd:items-end">
                        <span className="text-zinc-200 font-bold text-xs">Diagnosis Complete</span>
                        <span className="text-zinc-500 text-[10px] font-mono">10:45:36Z</span>
                      </div>
                    </div>
                  </div>

                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className="flex items-center justify-center w-3 h-3 rounded-full border border-amber-500 bg-amber-500/20 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ring-4 ring-amber-500/10">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                    </div>
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] pl-4 md:pl-0 md:group-odd:text-right">
                      <div className="flex flex-col md:group-odd:items-end">
                        <span className="text-amber-500 font-bold text-xs">Awaiting Approval</span>
                        <span className="text-zinc-500 text-[10px] font-mono">10:45:38Z</span>
                      </div>
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

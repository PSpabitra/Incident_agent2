import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Shield,
  RotateCcw,
  CheckCircle2,
  Zap,
  Search,
  Mail,
  ArrowUpRight,
  FileText,
} from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { incidentApi } from '@/services/api/endpoints';
import { formatRelativeTime } from '@/utils/formatters';
import { cn } from '@/utils/cn';
import type { Incident } from '@/types';

type Tab = 'OPEN' | 'ALL' | 'CLOSED';

export default function IncidentLoop() {
  const [activeTab, setActiveTab] = useState<Tab>('ALL');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['incidents-loop', page],
    queryFn: () => incidentApi.list({
      pageSize: 5,
      page
    }),
  });

  const rawIncidents = data?.items || [];
  const incidents = rawIncidents.filter(inc => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'CLOSED') return inc.status === 'resolved';
    if (activeTab === 'OPEN') return inc.status !== 'resolved';
    return true;
  });

  return (
    <PageWrapper bare noScroll>
      <div className="flex h-full bg-white overflow-hidden">
        {/* Incident List Sidebar */}
        <div className="w-[350px] flex flex-col border-r border-slate-100 h-full bg-white shrink-0">
          {/* Tabs */}
          <div className="p-4 border-b border-slate-50 flex items-center justify-between gap-1">
            {(['OPEN', 'ALL', 'CLOSED'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setPage(1);
                  setSelectedIncident(null);
                }}
                className={cn(
                  "flex-1 py-1.5 text-[10px] font-bold tracking-widest transition-all rounded-md",
                  activeTab === tab
                    ? "bg-slate-900 text-white shadow-md shadow-slate-200"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="px-4 py-3 bg-slate-50/50 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                {isLoading ? 'Loading...' : `${data?.total || 0} Incidents`}
              </span>
              {!isLoading && data && (
                <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                  Page {page} of {Math.ceil((data.total || 0) / 5) || 1}
                </span>
              )}
            </div>

            <div className="divide-y divide-slate-50">
              {incidents.map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncident(inc)}
                  className={cn(
                    "p-5 cursor-pointer transition-all hover:bg-slate-50 group relative",
                    selectedIncident?.id === inc.id && "bg-slate-50 border-l-4 border-slate-900 pl-4"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-blue-600 tracking-wider">#{inc.id.slice(-2)}</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] font-bold px-1.5 h-4 border-none uppercase tracking-tighter",
                        inc.priority === 'P1' ? "text-rose-500 bg-rose-50" :
                          inc.priority === 'P2' ? "text-orange-500 bg-orange-50" :
                            "text-blue-500 bg-blue-50"
                      )}
                    >
                      {inc.priority === 'P1' ? 'CRITICAL' : inc.priority === 'P2' ? 'HIGH' : inc.priority === 'P3' ? 'MEDIUM' : ''}
                    </Badge>
                  </div>

                  <h3 className="text-[13px] font-bold text-slate-900 mb-1.5 leading-tight group-hover:text-blue-600 transition-colors">
                    {inc.subject}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3 font-medium">
                    {inc.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] font-bold px-2 h-5 border-none tracking-widest uppercase",
                        inc.status === 'resolved' ? "bg-emerald-50 text-emerald-600" :
                          inc.status === 'analyzing' ? "bg-blue-50 text-blue-600" :
                            "bg-amber-50 text-amber-600"
                      )}
                    >
                      {inc.status.toUpperCase()}
                    </Badge>
                    <span className="text-[10px] text-slate-300 font-medium">{formatRelativeTime(inc.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-slate-50 flex items-center justify-between bg-white flex-none">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-8 text-[9px] font-bold tracking-widest px-3 border-slate-100"
            >
              PREV
            </Button>
            <div className="flex gap-1">
              {/* Small dot indicators for pages could go here if desired */}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={!data?.hasMore}
              className="h-8 text-[9px] font-bold tracking-widest px-3 border-slate-100"
            >
              NEXT
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 relative flex flex-col items-center bg-white overflow-y-auto custom-scrollbar">
          {/* Blueprint Grid Background */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
              backgroundSize: '30px 30px'
            }}
          />

          {selectedIncident ? (
            <div className="z-10 pt-6 pb-12 px-12 max-w-4xl w-full animate-in fade-in zoom-in duration-500">
              <div className="text-center mb-6">
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-2xl animate-pulse" />
                  <div className="relative w-16 h-16 rounded-[24px] bg-slate-900 flex items-center justify-center text-white mx-auto shadow-xl ring-4 ring-slate-50 transition-transform hover:scale-105 duration-500">
                    <RotateCcw className="h-8 w-8 animate-spin-slow" />
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Badge variant="outline" className="bg-blue-50/50 text-blue-600 border-blue-100/30 px-3 py-1 text-[9px] font-bold tracking-[0.2em] uppercase backdrop-blur-sm">
                    LOOP INVESTIGATION ACTIVE
                  </Badge>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">{selectedIncident.subject}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-slate-500 text-[10px] font-mono tracking-widest uppercase">{selectedIncident.id}</span>
                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                    {/* <span className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">Priority: {selectedIncident.severity}</span> */}
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] font-bold px-1.5 h-4 border-none uppercase tracking-tighter",
                        selectedIncident.priority === 'P1' ? "text-rose-500 bg-rose-50" :
                          selectedIncident.priority === 'P2' ? "text-orange-500 bg-orange-50" :
                            "text-blue-500 bg-blue-50"
                      )}
                    >
                      {selectedIncident.priority === 'P1' ? 'CRITICAL' : selectedIncident.priority === 'P2' ? 'HIGH' : selectedIncident.priority === 'P3' ? 'MEDIUM' : ''}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Flipkart Style Status Stepper */}
              <div className="bg-white/70 backdrop-blur-3xl rounded-[40px] p-12 border border-slate-100 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.06)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.015] group-hover:opacity-[0.03] transition-all duration-700 pointer-events-none translate-x-4 -translate-y-4">
                  <Shield className="h-48 w-48 text-slate-900" />
                </div>

                <div className="space-y-8 relative z-10">
                  {(() => {
                    const agentSteps = (selectedIncident.steps || []).filter(s =>
                      s.agent !== 'Mistral Analysis Agent' &&
                      s.agent !== 'KB Learning Agent'
                    );

                    const displaySteps = [];
                    for (const step of agentSteps) {
                      displaySteps.push(step);
                      if (step.action.toLowerCase().includes('email') && selectedIncident.status === 'resolved') {
                        displaySteps.push({
                          id: `resolved-${step.id}`,
                          action: 'Incident Resolved',
                          agent: 'System',
                          timestamp: selectedIncident.updatedAt || selectedIncident.createdAt || new Date().toISOString(),
                          output: 'The incident has been successfully resolved and closed.',
                          isSynthetic: true
                        });
                      }
                    }

                    const formatTime = (ts: string) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    const getStepStyles = (agent: string, action: string) => {
                      const a = agent.toLowerCase();
                      const act = action.toLowerCase();
                      const base = { bg: 'bg-emerald-50', border: 'border-emerald-200', color: 'text-emerald-600', shadow: 'shadow-emerald-100/50' };
                      
                      if (act.includes('email')) return { ...base, icon: <Mail className="h-3.5 w-3.5" /> };
                      if (a.includes('ingestion')) return { ...base, icon: <Zap className="h-3.5 w-3.5" /> };
                      if (a.includes('triage')) return { ...base, icon: <Search className="h-3.5 w-3.5" /> };
                      if (a.includes('resolution')) return { ...base, icon: <FileText className="h-3.5 w-3.5" /> };
                      if (a.includes('escalation')) return { ...base, icon: <ArrowUpRight className="h-3.5 w-3.5" /> };
                      return { ...base, icon: <CheckCircle2 className="h-3.5 w-3.5" /> };
                    };



                    const renderStepOutput = (step: any) => {
                      const isEmail = step.action.toLowerCase().includes('email');
                      if (isEmail) {
                        const lines = step.output.split('\n');
                        // Use summary from the output if available, else just the output
                        const summary = lines.find((l: string) => l.startsWith('Summary:'))?.replace('Summary:', '').trim() || step.output.replace(/Recipient: .*\n?/, '').trim();
                        const incidentEmails = selectedIncident.emails || [];

                        return (
                          <div className="mt-6 bg-slate-900 rounded-[32px] p-8 border border-slate-800 text-slate-300 shadow-2xl relative overflow-hidden animate-in slide-in-from-top-4 duration-700">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                              <Mail className="h-32 w-32" />
                            </div>
                            <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-5 relative z-10">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                  <Mail className="h-5 w-5 text-blue-400" />
                                </div>
                                <div>
                                  <span className="text-[11px] font-black text-white uppercase tracking-[0.2em] block">
                                    SYSTEM GENERATED EMAIL
                                  </span>
                                </div>
                              </div>
                              <Badge variant="outline" className={cn(
                                "text-[9px] font-black border-none px-3 py-1",
                                step.action.toLowerCase().includes('sent') ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                              )}>
                                {step.action.toLowerCase().includes('sent') ? 'SENT SUCCESSFULLY' : 'ACTION SKIPPED'}
                              </Badge>
                            </div>

                            <div className="space-y-8 relative z-10">
                              {summary && summary !== step.output && (
                                <div>
                                  <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <FileText className="h-3 w-3 text-slate-500" />
                                    Email Content Summary
                                  </div>
                                  <div className="text-[13px] leading-relaxed text-slate-300 font-medium bg-white/5 p-4 rounded-2xl border border-white/5 italic">
                                    "{summary}"
                                  </div>
                                </div>
                              )}

                              {incidentEmails.length > 0 ? (
                                <div>
                                  <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Mail className="h-3 w-3 text-slate-500" />
                                    Dispatched Emails ({incidentEmails.length})
                                  </div>
                                  <div className="space-y-3">
                                    {incidentEmails.map((email: any, index: number) => (
                                      <div key={email.id} className="bg-slate-950/50 rounded-2xl p-5 border border-slate-800/50 flex flex-col gap-3 transition-colors hover:border-slate-700/50 hover:bg-slate-950">
                                        <div className="flex items-center justify-between mb-1">
                                          <div className="flex items-center gap-3">
                                            <Badge variant="outline" className={cn(
                                              "text-[9px] font-black uppercase tracking-widest border-none px-2 py-0.5",
                                              email.status === 'sent' ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                                            )}>
                                              {email.status}
                                            </Badge>
                                            <span className="text-[10px] text-slate-500 font-mono tracking-wider">
                                              {formatTime(email.sent_at || email.created_at)}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-[9px] font-bold text-blue-400 bg-blue-500/10 border-none px-2 uppercase tracking-widest">
                                              L{index + 1} Engineers
                                            </Badge>
                                            <Badge variant="outline" className="text-[9px] font-bold text-slate-400 bg-slate-800/50 border-none px-2 uppercase tracking-widest">
                                              {email.template?.replace(/_/g, ' ')}
                                            </Badge>
                                          </div>
                                        </div>

                                        <div className="space-y-1.5 bg-slate-900/50 p-4 rounded-xl border border-slate-800/30">
                                          <div className="text-[12px] font-medium text-slate-300 flex items-start gap-2">
                                            <span className="text-slate-600 font-mono text-[10px] uppercase tracking-widest w-16 mt-0.5 shrink-0">To:</span>
                                            <span className="text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-md font-mono text-[11px] break-all">{email.to_address}</span>
                                          </div>
                                          <div className="text-[12px] font-medium text-slate-300 flex items-start gap-2">
                                            <span className="text-slate-600 font-mono text-[10px] uppercase tracking-widest w-16 mt-0.5 shrink-0">Subject:</span>
                                            <span className="text-slate-200">{email.subject}</span>
                                          </div>
                                          {email.error && (
                                            <div className="text-[12px] font-medium text-rose-400 flex items-start gap-2 mt-2 pt-2 border-t border-slate-800">
                                              <span className="text-rose-900 font-mono text-[10px] uppercase tracking-widest w-16 mt-0.5 shrink-0">Error:</span>
                                              <span>{email.error}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                // Fallback to parsing if no emails array provided
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                  {step.output.includes('Recipient:') && (
                                    <div className="md:col-span-1">
                                      <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Recipient</div>
                                      <div className="text-[12px] text-blue-400 font-mono bg-blue-400/5 px-3 py-2 rounded-xl border border-blue-400/10 truncate">
                                        {lines.find((l: string) => l.startsWith('Recipient:'))?.replace('Recipient:', '').trim()}
                                      </div>
                                    </div>
                                  )}
                                  {!summary && (
                                    <div className="md:col-span-2">
                                      <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Body Summary</div>
                                      <div className="text-[13px] leading-relaxed text-slate-300 font-medium bg-white/5 p-4 rounded-2xl border border-white/5 italic">
                                        "{step.output}"
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }

                      let output = step.output;
                      if (step.agent === 'Triage Agent') {
                        output = output
                          .replace(/Severity: \w+ · /, '')
                          .replace(/Priority: \w+ · /, '')
                          .replace(/ · Confidence: [\d.]+%?/, '');
                      }

                      return <p className="text-[11px] text-slate-400 font-medium leading-relaxed mt-1">{output}</p>;
                    };

                    return displaySteps.map((step, idx) => {
                      const styles = getStepStyles(step.agent, step.action);
                      return (
                        <div key={step.id} className="relative flex gap-6 group/step">
                          {/* Connector Line */}
                          {idx !== displaySteps.length - 1 && (
                            <div className="absolute left-[11px] top-8 w-px h-full bg-emerald-100 group-hover/step:bg-emerald-200 transition-colors overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-b from-emerald-400 to-emerald-600 opacity-30" />
                            </div>
                          )}

                          {/* Step Indicator */}
                          <div className={cn(
                            "relative z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 border-2",
                            styles.bg,
                            styles.border,
                            idx === agentSteps.length - 1 && styles.shadow
                          )}>
                            <div className={cn(
                              "transition-colors",
                              styles.color
                            )}>
                              {styles.icon}
                            </div>
                          </div>

                          {/* Step Label */}
                          <div className="flex-1 -mt-1">
                            <div className="flex items-center justify-between gap-4 mb-1">
                              <div className="flex items-center gap-2">
                                <h4 className="text-[13px] font-bold tracking-tight text-slate-900">
                                  {step.action.toLowerCase().includes('email')
                                    ? (selectedIncident.priority === 'P1' ? ' Email Notification' : ' Email Notification')
                                    : step.action}
                                </h4>
                                <Badge variant="outline" className="text-[8px] font-bold text-slate-400 bg-slate-50 border-none px-1.5 h-4">
                                  {step.agent}
                                </Badge>
                              </div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{formatTime(step.timestamp)}</span>
                            </div>
                            {renderStepOutput(step)}
                          </div>
                        </div>
                      );
                    })
                  })()}
                </div>

                <div className="mt-12 pt-8 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 overflow-hidden ring-1 ring-slate-100">
                             <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="Agent" className="w-full h-full object-cover opacity-80" />
                          </div>
                        ))}
                      </div> */}
                    {/* <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">3 Agents Active</span> */}
                  </div>
                  {/* <button className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline">
                      View Audit Log
                    </button> */}
                </div>
              </div>
            </div>
          ) : (
            <div className="z-10 my-auto text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="relative mb-8 flex justify-center">
                <Shield className="h-24 w-24 text-slate-50" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <RotateCcw className="h-8 w-8 text-slate-200 animate-pulse" />
                </div>
              </div>
              <h2 className="text-[13px] font-bold text-slate-400 tracking-[0.2em] mb-3">
                SELECT AN INCIDENT TO BEGIN INVESTIGATION
              </h2>
              <p className="text-[10px] font-bold text-slate-300 tracking-[0.15em] flex items-center justify-center gap-4">
                <span className="w-8 h-px bg-slate-100" />
                OR INJECT A SYNTHETIC ONE TO WATCH THE LOOP RUN
                <span className="w-8 h-px bg-slate-100" />
              </p>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}

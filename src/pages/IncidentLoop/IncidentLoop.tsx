import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Shield, RotateCcw, CheckCircle2 } from 'lucide-react';
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
    queryKey: ['incidents-loop', activeTab, page],
    queryFn: () => incidentApi.list({ 
      status: activeTab === 'ALL' ? undefined : activeTab.toLowerCase(),
      pageSize: 5,
      page 
    }),
  });

  const incidents = data?.items || [];

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
                      {inc.priority === 'P1' ? 'CRITICAL' : inc.priority === 'P2' ? 'HIGH' : 'LOW'}
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
        <div className="flex-1 relative flex items-center justify-center bg-white overflow-hidden">
          {/* Blueprint Grid Background */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-[0.03]" 
            style={{ 
              backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
              backgroundSize: '30px 30px'
            }} 
          />

          {selectedIncident ? (
             <div className="z-10 p-12 max-w-2xl w-full animate-in fade-in zoom-in duration-300">
                <div className="text-center mb-10">
                  <div className="w-16 h-16 rounded-3xl bg-slate-900 flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-slate-200">
                    <RotateCcw className="h-8 w-8 animate-spin-slow" />
                  </div>
                  <Badge variant="outline" className="mb-4 bg-blue-50 text-blue-600 border-blue-100 px-3 py-1 text-[10px] font-bold tracking-widest uppercase">
                    LOOP INVESTIGATION ACTIVE
                  </Badge>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">{selectedIncident.subject}</h2>
                  <p className="text-slate-400 text-xs font-mono tracking-tight uppercase">{selectedIncident.id}</p>
                </div>

                {/* Flipkart Style Status Stepper */}
                <div className="bg-white rounded-[32px] p-10 border border-slate-100 shadow-2xl shadow-slate-200/50 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                    <Shield className="h-32 w-32 text-slate-900" />
                  </div>

                  <div className="space-y-10 relative z-10">
                    {[
                      { label: 'Incident Ingested', sub: 'Successfully received from source', status: 'completed', time: '12:30 PM' },
                      { label: 'AI Agent Triage', sub: 'Mistral analyzing root cause hypothesis', status: 'completed', time: '12:32 PM' },
                      { label: 'Context Gathering', sub: 'Searching Knowledge Base & Runbooks', status: 'current', time: 'In Progress' },
                      { label: 'Final Remediation', sub: 'Automated fix application', status: 'pending', time: 'Pending' },
                    ].map((step, idx, arr) => (
                      <div key={step.label} className="relative flex gap-6">
                        {/* Connector Line */}
                        {idx !== arr.length - 1 && (
                          <div className={cn(
                            "absolute left-[11px] top-8 w-0.5 h-10 transition-colors",
                            step.status === 'completed' ? "bg-emerald-500" : "bg-slate-100"
                          )} />
                        )}

                        {/* Step Icon */}
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 transition-all shadow-sm",
                          step.status === 'completed' ? "bg-emerald-500 text-white" : 
                          step.status === 'current' ? "bg-blue-600 text-white ring-4 ring-blue-50 animate-pulse" : 
                          "bg-slate-100 text-slate-400"
                        )} >
                          {step.status === 'completed' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                        </div>

                        {/* Step Label */}
                        <div className="flex-1 -mt-1">
                          <div className="flex items-center justify-between gap-4 mb-1">
                            <h4 className={cn(
                              "text-[13px] font-bold tracking-tight",
                              step.status === 'pending' ? "text-slate-400" : "text-slate-900"
                            )}>{step.label}</h4>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{step.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{step.sub}</p>
                        </div>
                      </div>
                    ))}
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
            <div className="z-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
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

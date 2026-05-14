import { CheckCircle2, AlertCircle, ShieldCheck, ListChecks, Settings, Info, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

interface ManualRichSummaryProps {
  data: {
    overview?: string;
    features?: string[];
    prerequisites?: string[];
    setup_steps?: {
      api_token_creation?: string[];
      connector_configuration?: string[];
      webhook_setup?: string[];
      status_mapping?: string;
    };
    testing?: {
      connection_testing?: string[];
    };
    troubleshooting?: {
      common_issues?: string[];
    };
    example_configuration?: Record<string, string>;
    security_best_practices?: string[];
    conclusion?: string;
  };
  className?: string;
}

const ManualRichSummary = ({ data, className }: ManualRichSummaryProps) => {
  if (!data) return null;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Overview */}
      {data.overview && (
        <div className="space-y-2">
          <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 uppercase tracking-tight">
            <Info className="h-4 w-4 text-blue-500" /> Overview
          </h4>
          <p className="text-sm text-slate-600 leading-relaxed italic border-l-2 border-blue-200 pl-3">
            {data.overview}
          </p>
        </div>
      )}

      {/* Features */}
      {data.features && data.features.length > 0 && (
        <div className="space-y-3">
          <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 uppercase tracking-tight">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Key Features
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {data.features.map((feature, i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-emerald-50/30 border border-emerald-100/50">
                <Badge variant="success" className="mt-1 h-1.5 w-1.5 rounded-full p-0 flex-shrink-0" />
                <span className="text-xs text-slate-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prerequisites */}
      {data.prerequisites && data.prerequisites.length > 0 && (
        <div className="space-y-2">
          <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 uppercase tracking-tight">
            <ListChecks className="h-4 w-4 text-amber-500" /> Prerequisites
          </h4>
          <ul className="grid grid-cols-1 gap-1.5">
            {data.prerequisites.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                <div className="h-1 w-1 rounded-full bg-amber-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Setup Steps */}
      {data.setup_steps && (
        <div className="space-y-4">
          <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 uppercase tracking-tight">
            <Settings className="h-4 w-4 text-slate-700" /> Setup & Configuration
          </h4>
          
          <div className="space-y-4 ml-2 border-l-2 border-slate-100 pl-4">
            {data.setup_steps.api_token_creation && (
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">API Token Creation</p>
                <ol className="space-y-1.5">
                  {data.setup_steps.api_token_creation.map((step, i) => (
                    <li key={i} className="text-xs text-slate-600 flex gap-2">
                      <span className="font-bold text-slate-400">{i + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {data.setup_steps.connector_configuration && (
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Connector Fields</p>
                <div className="flex flex-wrap gap-1.5">
                  {data.setup_steps.connector_configuration.map((field, i) => (
                    <Badge key={i} variant="muted" className="text-[10px] font-medium bg-slate-100 text-slate-600 border-none">
                      {field}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {data.setup_steps.webhook_setup && (
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Webhook Configuration</p>
                <ul className="space-y-1">
                  {data.setup_steps.webhook_setup.map((step, i) => (
                    <li key={i} className="text-xs text-slate-600 flex gap-2 items-start">
                      <div className="mt-1.5 h-1 w-1 rounded-full bg-indigo-400 flex-shrink-0" />
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.setup_steps.status_mapping && (
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Status Mapping</p>
                <p className="text-xs text-slate-600">{data.setup_steps.status_mapping}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Troubleshooting */}
      {data.troubleshooting?.common_issues && (
        <div className="space-y-2">
          <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 uppercase tracking-tight">
            <HelpCircle className="h-4 w-4 text-rose-500" /> Troubleshooting
          </h4>
          <div className="space-y-2">
            {data.troubleshooting.common_issues.map((issue, i) => (
              <div key={i} className="p-2.5 rounded-lg border border-rose-100 bg-rose-50/30 text-xs text-slate-700">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="h-3 w-3 text-rose-500" />
                  <span className="font-bold text-rose-700">Issue {i + 1}</span>
                </div>
                {issue}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Best Practices */}
      {data.security_best_practices && data.security_best_practices.length > 0 && (
        <div className="space-y-2 p-3 rounded-xl bg-slate-900 text-slate-50">
          <h4 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" /> Security Best Practices
          </h4>
          <ul className="space-y-1.5 mt-2">
            {data.security_best_practices.map((item, i) => (
              <li key={i} className="text-[11px] flex gap-2 leading-relaxed opacity-90">
                <span className="text-cyan-400 font-bold">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Example Configuration */}
      {data.example_configuration && (
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Example Config</h4>
          <div className="grid grid-cols-2 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden">
            {Object.entries(data.example_configuration).map(([key, value]) => (
              <div key={key} className="contents">
                <div className="bg-slate-50 p-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{key.replace(/_/g, ' ')}</div>
                <div className="bg-white p-2 text-xs font-medium text-slate-700">{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conclusion */}
      {data.conclusion && (
        <p className="text-[11px] text-slate-400 text-center pt-4 border-t border-slate-100">
          {data.conclusion}
        </p>
      )}
    </div>
  );
};

export { ManualRichSummary };
export default ManualRichSummary;


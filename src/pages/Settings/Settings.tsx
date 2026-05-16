import { Save, Bot, Bell, Plug, Shield } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { themeOptions } from '@/config/theme.config';

export default function Settings() {
  const { user } = useAuth();
  const { mode, setMode } = useTheme();

  return (
    <PageWrapper
      title="Settings & Integrations"
      description="Manage agent behaviour, notifications, and connected systems."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Profile */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-4 w-4" /> Profile
              </CardTitle>
              <CardDescription>Your account details and role.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Full name" defaultValue={user?.fullName ?? ''} />
                <Input label="Email" type="email" defaultValue={user?.email ?? ''} disabled />
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="primary" className="uppercase">
                  {user?.role ?? 'guest'}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Role assignments are managed by your admin.
                </span>
              </div>
              <Button leftIcon={<Save className="h-4 w-4" />}>Save Profile</Button>
            </CardContent>
          </Card>

          {/* Agent behaviour */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-4 w-4" /> Agent Behaviour
              </CardTitle>
              <CardDescription>
                Tune how aggressive the resolution agent is with auto-remediation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                label="Auto-remediation threshold"
                defaultValue="0.85"
                options={[
                  { value: '0.95', label: 'Conservative — 95% confidence required' },
                  { value: '0.85', label: 'Balanced — 85% confidence required (default)' },
                  { value: '0.70', label: 'Aggressive — 70% confidence required' },
                  { value: '1.00', label: 'Disabled — humans approve every action' },
                ]}
              />
              <Select
                label="Auto-escalation timer"
                defaultValue="15"
                options={[
                  { value: '5', label: '5 minutes' },
                  { value: '15', label: '15 minutes (default)' },
                  { value: '30', label: '30 minutes' },
                  { value: '60', label: '1 hour' },
                ]}
              />
              <Select
                label="KB auto-publish"
                defaultValue="draft"
                options={[
                  { value: 'auto', label: 'Auto-publish new articles' },
                  { value: 'draft', label: 'Save as draft for review (default)' },
                  { value: 'off', label: 'Do not generate articles' },
                ]}
              />
              <Button leftIcon={<Save className="h-4 w-4" />}>Apply Settings</Button>
            </CardContent>
          </Card> */}

          {/* Notifications */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-4 w-4" /> Notifications
              </CardTitle>
              <CardDescription>Where the agent sends alerts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input label="Slack webhook" placeholder="https://hooks.slack.com/services/…" />
              <Input
                label="On-call email distribution list"
                type="email"
                placeholder="oncall@company.com"
              />
              <Button leftIcon={<Save className="h-4 w-4" />}>Save Channels</Button>
            </CardContent>
          </Card> */}
        </div>

        {/* Side */}
        <div className="space-y-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">Theme preference</p>
              <div className="space-y-1.5">
                {themeOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setMode(opt.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm border transition-all ${
                      mode === opt.id
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:bg-surface-hover'
                    }`}
                  >
                    <p className="font-medium">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plug className="h-4 w-4" /> Integrations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Integration name="ServiceNow" connected />
              <Integration name="Datadog" connected />
              <Integration name="PagerDuty" />
              <Integration name="Jira" connected />
              <Integration name="Splunk" />
              <Integration name="GitHub" />
            </CardContent>
          </Card> */}
        </div>
      </div>
    </PageWrapper>
  );
}

function Integration({ name, connected = false }: { name: string; connected?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
      <span className="text-sm font-medium">{name}</span>
      {connected ? (
        <Badge variant="success" dot>
          Connected
        </Badge>
      ) : (
        <Button size="xs" variant="outline">
          Connect
        </Button>
      )}
    </div>
  );
}

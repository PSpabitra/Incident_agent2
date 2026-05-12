import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sparkles, Mail, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/useToast';
import { loginSchema, type LoginInput } from '@/utils/validators';
import { appConfig } from '@/config/app.config';
import { ThemeToggle } from '@/components/layout/Header/ThemeToggle';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { error: errorToast, success } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'admin@example.com', password: 'admin1234' },
  });

  if (isAuthenticated) {
    return <Navigate to={appConfig.routes.dashboard} replace />;
  }

  const onSubmit = async (data: LoginInput) => {
    setSubmitting(true);
    try {
      await login(data.email, data.password);
      success('Signed in', `Welcome back, ${data.email.split('@')[0]}!`);
      const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
      navigate(from && from !== appConfig.routes.login ? from : appConfig.routes.dashboard, {
        replace: true,
      });
    } catch (err) {
      errorToast(
        'Sign-in failed',
        err instanceof Error ? err.message : 'Please check your credentials and try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden">
      {/* Decorative background */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 20% 20%, rgb(var(--color-primary) / 0.18), transparent 40%), radial-gradient(circle at 80% 70%, rgb(var(--color-accent) / 0.18), transparent 40%)',
        }}
      />
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md mx-4"
      >
        <div className="rounded-2xl border border-border bg-surface shadow-soft-lg p-8">
          <div className="flex items-center gap-2.5 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-soft-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-bold leading-tight text-foreground">{appConfig.name}</p>
              <p className="text-xs text-muted-foreground">Enterprise ITSM Automation</p>
            </div>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Sign in to access the agent operations console.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              leftIcon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              leftIcon={<Lock className="h-4 w-4" />}
              error={errors.password?.message}
              {...register('password')}
            />

            <Button
              type="submit"
              size="lg"
              fullWidth
              isLoading={submitting}
              rightIcon={!submitting ? <ArrowRight className="h-4 w-4" /> : undefined}
            >
              Sign in
            </Button>
          </form>

          <div className="mt-6 rounded-md border border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">Demo accounts</p>
            <p>
              <span className="font-mono">admin@example.com</span> / admin1234
            </p>
            <p>
              <span className="font-mono">engineer@example.com</span> / engineer123
            </p>
            <p>
              <span className="font-mono">user@example.com</span> / user12345
            </p>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Protected by enterprise-grade security · v{appConfig.version} ·{' '}
          <a href="/welcome" className="text-primary hover:underline">
            About this project
          </a>
        </p>
      </motion.div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { Home, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { appConfig } from '@/config/app.config';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground mb-5 shadow-soft-md">
          <Sparkles className="h-6 w-6" />
        </div>
        <p className="text-7xl font-extrabold gradient-text tracking-tighter">404</p>
        <h1 className="mt-3 text-2xl font-bold text-foreground">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The agent couldn't locate that route in its knowledge graph.
        </p>
        <Link to={appConfig.routes.dashboard} className="inline-block mt-6">
          <Button leftIcon={<Home className="h-4 w-4" />}>Back to Dashboard</Button>
        </Link>
      </motion.div>
    </div>
  );
}

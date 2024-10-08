import type { ReactNode } from 'react';
import { lazy, Suspense } from 'react';
import { MonitorContext } from './monitor.use-monitor';
import { ENV, getServerUrl } from '../config';

const SENTRY_DSN =
  'https://a485f37a0cffb47b727372c209581f1e@o4507753746071552.ingest.us.sentry.io/4507753753018368';

const SentryLazy = lazy(() =>
  import('@sentry/react').then((SentryReact) => {
    SentryReact.init({
      dsn: SENTRY_DSN,
      environment: ENV,
      integrations: [
        SentryReact.browserTracingIntegration(),
        SentryReact.replayIntegration(),
      ],
      tracesSampleRate: 1.0,
      tracePropagationTargets: ['localhost', getServerUrl()],
      // limit replay sampling
      replaysSessionSampleRate: ENV === 'prod' ? 0.1 : 0,
      replaysOnErrorSampleRate: ENV === 'prod' ? 1.0 : 0,
    });
    console.log('monitor initialized');
    const SentryProvider = ({ children }: { children: ReactNode }) => {
      return (
        <SentryReact.ErrorBoundary>
          <MonitorContext.Provider
            value={{ captureException: SentryReact.captureException }}
          >
            {children}
          </MonitorContext.Provider>
        </SentryReact.ErrorBoundary>
      );
    };
    return {
      default: SentryProvider,
    };
  }),
);

export const MonitorProvider = ({ children }: { children: ReactNode }) => {
  return (
    <Suspense fallback={<>{children}</>}>
      <SentryLazy>{children}</SentryLazy>
    </Suspense>
  );
};

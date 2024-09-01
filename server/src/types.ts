import type { KVNamespace } from '@cloudflare/workers-types';
import type { Context as HonoContext } from 'hono';
import type app from './index';

export interface Env {
  ALLOWED_HOST: string;
  DB: KVNamespace;
  ENV: 'dev' | 'local' | 'prod';
}

export type Context = HonoContext<{
  Bindings: Env;
}>;

export type ServerApi = typeof app;

export interface HighScoreEntry {
  name: string;
  score: number;
  timestamp: number;
}

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { highScoreRoute } from './high-score';
import type { Env } from './types';

const app = new Hono<{ Bindings: Env }>()
  .use('*', async (c, next) => {
    const allowedHost = c.env.ALLOWED_HOST;
    const origin =
      allowedHost === '*' ? '*' : new URL(c.req.header('referer') || '').origin;
    if (origin.endsWith(allowedHost)) {
      return cors({
        origin,
        allowMethods: ['GET', 'POST', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'baggage', 'sentry-trace'],
        exposeHeaders: ['Content-Type'],
      })(c, next);
    }
    // If referer is not allowed, fail the request
    throw new HTTPException(403, { message: 'Forbidden' });
  })
  .use('*', async (c, next) => {
    await next();
    c.res.headers.set('X-Git-Branch', process.env.GITHUB_REF_NAME || '');
    c.res.headers.set('X-Git-Commit', process.env.GITHUB_SHA || '');
  })
  .get('/', async (c) => c.text('ok', 200))
  .notFound(() => {
    throw new HTTPException(404, { message: 'Not Found' });
  })
  .onError((err, c) => {
    console.error(err);
    if (err instanceof HTTPException) {
      return c.json({ message: err.message }, err.status);
    }
    return c.json({ message: 'Unknown server error', cause: err }, 500);
  })
  .route('/high-score', highScoreRoute);

export default app;

/**
 * Interceptors are configured inside `client.ts` (constructor of ApiClient).
 * This module is kept as a public seam so additional cross-cutting concerns
 * (e.g. tracing headers, telemetry) can be attached later without touching
 * call sites.
 */
export { apiClient } from './client';

import axios, { type AxiosInstance, type InternalAxiosRequestConfig, AxiosError } from 'axios';
import { apiConfig } from '@/config/api.config';
import { appConfig } from '@/config/app.config';
import { storage } from '@/services/storage';

/**
 * The single Axios instance used by the entire app.
 * Interceptors handle:
 *   1. Attaching the JWT access token to every outgoing request.
 *   2. Auto-refreshing the token on 401 responses (single-flight).
 *   3. Logging the user out on refresh failure.
 *   4. Surfacing a normalised error message that React Query can consume.
 */
class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private refreshQueue: Array<(token: string | null) => void> = [];

  constructor() {
    this.client = axios.create({
      baseURL: apiConfig.baseURL,
      timeout: apiConfig.timeout,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    this.attachInterceptors();
  }

  private attachInterceptors(): void {
    // ---- Request: attach access token --------------------------------------
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = storage.get<string>(appConfig.storage.authKey);
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // ---- Response: refresh on 401, normalise errors ------------------------
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !original._retry && original.url !== apiConfig.endpoints.auth.refresh) {
          original._retry = true;

          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.refreshQueue.push((token) => {
                if (!token) return reject(error);
                if (original.headers) original.headers.Authorization = `Bearer ${token}`;
                resolve(this.client(original));
              });
            });
          }

          this.isRefreshing = true;

          try {
            const refreshToken = storage.get<string>(appConfig.storage.refreshKey);
            if (!refreshToken) throw new Error('No refresh token');

            const { data } = await axios.post(
              `${apiConfig.baseURL}${apiConfig.endpoints.auth.refresh}`,
              { refresh_token: refreshToken },
            );

            const newAccess = data.data?.access_token ?? data.access_token;
            storage.set(appConfig.storage.authKey, newAccess);

            this.refreshQueue.forEach((cb) => cb(newAccess));
            this.refreshQueue = [];

            if (original.headers) original.headers.Authorization = `Bearer ${newAccess}`;
            return this.client(original);
          } catch (refreshError) {
            this.refreshQueue.forEach((cb) => cb(null));
            this.refreshQueue = [];
            storage.remove(appConfig.storage.authKey);
            storage.remove(appConfig.storage.refreshKey);
            window.location.href = appConfig.routes.login;
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(this.normalizeError(error));
      },
    );
  }

  private normalizeError(error: AxiosError): Error {
    const data = error.response?.data as { error?: { message?: string }; message?: string } | undefined;
    const msg =
      data?.error?.message ||
      data?.message ||
      error.message ||
      'An unexpected error occurred';
    const wrapped = new Error(msg) as Error & { status?: number; original?: AxiosError };
    wrapped.status = error.response?.status;
    wrapped.original = error;
    return wrapped;
  }

  get instance(): AxiosInstance {
    return this.client;
  }
}

export const apiClient = new ApiClient().instance;

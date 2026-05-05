const API_BASE_URL = (
  import.meta.env.DEV
    ? 'http://127.0.0.1:8000/api'
    : (import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api')
).replace(/\/+$/, '');

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiRequestOptions extends Omit<RequestInit, 'method'> {
  method?: HttpMethod;
  auth?: boolean;
  queryParams?: Record<string, string | number | boolean | undefined>;
}

const buildUrl = (
  endpoint: string,
  queryParams?: Record<string, string | number | boolean | undefined>,
) => {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = new URL(`${API_BASE_URL}${normalizedEndpoint}`);

  if (queryParams) {
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
};

const getAccessToken = () => localStorage.getItem('access_token');

export const saveAuthTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
};

export const clearAuthTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

const parseResponseBody = async (response: Response) => {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const extractErrorMessage = (responseBody: unknown, status: number) => {
  if (typeof responseBody === 'object' && responseBody !== null) {
    if ('detail' in responseBody) {
      return String((responseBody as { detail: unknown }).detail);
    }
    if ('non_field_errors' in responseBody) {
      const errors = (responseBody as { non_field_errors?: unknown }).non_field_errors;
      if (Array.isArray(errors) && errors.length > 0) {
        return String(errors[0]);
      }
    }

    const entries = Object.entries(responseBody as Record<string, unknown>);
    if (entries.length > 0) {
      const value = entries[0][1];
      if (Array.isArray(value) && value.length > 0) {
        return String(value[0]);
      }
      if (typeof value === 'string') {
        return value;
      }
    }
  }

  return `Error ${status}`;
};

export const apiRequest = async <T>(
  endpoint: string,
  { method = 'GET', auth = true, queryParams, headers, body, ...rest }: ApiRequestOptions = {},
): Promise<T> => {
  const token = getAccessToken();
  const shouldUseJson = body !== undefined && !(body instanceof FormData);
  const resolvedHeaders = new Headers(headers);

  if (shouldUseJson && !resolvedHeaders.has('Content-Type')) {
    resolvedHeaders.set('Content-Type', 'application/json');
  }

  if (auth && token) {
    resolvedHeaders.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(endpoint, queryParams), {
    method,
    headers: resolvedHeaders,
    body,
    ...rest,
  });

  const responseBody = await parseResponseBody(response);

  if (!response.ok) {
    throw new Error(extractErrorMessage(responseBody, response.status));
  }

  return responseBody as T;
};


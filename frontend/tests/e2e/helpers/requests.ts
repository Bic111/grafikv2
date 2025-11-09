import type { APIRequestContext } from '@playwright/test';

type Json = Record<string, unknown> | Array<unknown>;

export async function getJson<T>(api: APIRequestContext, url: string, expectedStatus = 200): Promise<T> {
  const response = await api.get(url);
  if (response.status() !== expectedStatus) {
    throw new Error(
      `GET ${url} returned ${response.status()} instead of ${expectedStatus}: ${await response.text()}`,
    );
  }
  return (await response.json()) as T;
}

export async function postJson<T>(
  api: APIRequestContext,
  url: string,
  body: Json,
  expectedStatus = 200,
): Promise<T> {
  const response = await api.post(url, { data: body });
  if (response.status() !== expectedStatus) {
    throw new Error(
      `POST ${url} returned ${response.status()} instead of ${expectedStatus}: ${await response.text()}`,
    );
  }
  return (await response.json()) as T;
}

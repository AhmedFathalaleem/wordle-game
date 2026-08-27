import type { ApiResponse } from '@portfolio/shared-types';

export type ApiClientConfig = {
  baseUrl: string;
};

export function createApiClient(config: ApiClientConfig) {
  const { baseUrl } = config;

  async function get<T>(path: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${baseUrl}${path}`);

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return response.json() as Promise<ApiResponse<T>>;
  }

  return { get };
}

export type ApiClient = ReturnType<typeof createApiClient>;

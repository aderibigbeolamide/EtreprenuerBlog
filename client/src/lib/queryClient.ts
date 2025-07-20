import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { APP_CONFIG } from "@shared/constants";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  url: string,
  options: {
    method?: string;
    data?: unknown;
  } = {}
): Promise<Response> {
  // Use relative URLs when APP_DOMAIN is empty (browser environment)
  const apiUrl = APP_CONFIG.APP_DOMAIN ? `${APP_CONFIG.APP_DOMAIN}${url}` : url;
  
  const res = await fetch(apiUrl, {
    method: options.method || "GET",
    headers: options.data ? { "Content-Type": "application/json" } : {},
    body: options.data ? JSON.stringify(options.data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.join("/") as string;
    // Use relative URLs when APP_DOMAIN is empty (browser environment)
    const apiUrl = APP_CONFIG.APP_DOMAIN ? `${APP_CONFIG.APP_DOMAIN}${url}` : url;
    
    const res = await fetch(apiUrl, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

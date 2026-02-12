type ApiMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'

export type ApiRequest<TBody = unknown> = {
  method?: ApiMethod
  body?: TBody
  headers?: HeadersInit
}

export class ApiError extends Error {
  status: number
  payload?: unknown

  constructor(message: string, status: number, payload?: unknown) {
    super(message)
    this.status = status
    this.payload = payload
  }
}

export async function apiFetch<TResponse, TBody = unknown>(
  url: string,
  options: ApiRequest<TBody> = {}
): Promise<TResponse> {
  const { method = 'GET', body, headers } = options
  const res = await fetch(url, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  let payload: unknown = null
  try {
    payload = await res.json()
  } catch {
    // ignore JSON parse failure
  }

  if (!res.ok) {
    const message = (payload as { error?: string })?.error ?? 'Request failed'
    throw new ApiError(message, res.status, payload)
  }

  return payload as TResponse
}

export const GENERIC_API_ERROR = 'Something went wrong. Please try again.';
export const NETWORK_API_ERROR = "Can't reach the server. Check that it is running and try again.";

export type ApiFieldErrors = Record<string, string>;

export type ParsedApiError = {
  message: string | null;
  fieldErrors: ApiFieldErrors;
};

function collectMessages(value: unknown): string[] {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }
  if (Array.isArray(value)) {
    return value.flatMap(collectMessages);
  }
  if (value && typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).flatMap(collectMessages);
  }
  return [];
}

function looksLikeHtml(value: unknown): boolean {
  return typeof value === 'string' && /<!doctype html|<html[\s>]/i.test(value);
}

function readResponse(error: unknown): { status?: number; data?: unknown } | null | undefined {
  if (!error || typeof error !== 'object' || !('response' in error)) {
    return undefined;
  }
  const response = (error as { response?: { status?: number; data?: unknown } | null }).response;
  if (response == null) return null;
  return response;
}

export function parseApiError(error: unknown): ParsedApiError {
  const response = readResponse(error);

  if (response === undefined) {
    console.error(error);
    return { message: GENERIC_API_ERROR, fieldErrors: {} };
  }

  if (response === null) {
    console.error(error);
    return { message: NETWORK_API_ERROR, fieldErrors: {} };
  }

  if (response.status === 401) {
    return { message: null, fieldErrors: {} };
  }

  const data = response.data;

  if (looksLikeHtml(data)) {
    console.error(data);
    return { message: GENERIC_API_ERROR, fieldErrors: {} };
  }

  if (typeof data === 'string') {
    const trimmed = data.trim();
    if (!trimmed || (response.status ?? 0) >= 500) {
      console.error(data);
      return { message: GENERIC_API_ERROR, fieldErrors: {} };
    }
    return { message: trimmed, fieldErrors: {} };
  }

  const record = data && typeof data === 'object' ? (data as Record<string, unknown>) : null;
  const detailMessages = record ? collectMessages(record.detail) : [];
  const fieldErrors: ApiFieldErrors = {};
  if (record) {
    for (const [key, value] of Object.entries(record)) {
      if (key === 'detail') continue;
      const messages = collectMessages(value);
      if (messages.length > 0) fieldErrors[key] = messages.join(' ');
    }
  }

  const fieldMessages = Object.values(fieldErrors);
  if (fieldMessages.length > 0 || detailMessages.length > 0) {
    if ((response.status ?? 0) >= 500 && detailMessages.length === 0) {
      console.error(data);
      return { message: GENERIC_API_ERROR, fieldErrors: {} };
    }
    const messageParts = [...detailMessages];
    for (const fieldMessage of fieldMessages) {
      if (!messageParts.includes(fieldMessage)) messageParts.push(fieldMessage);
    }
    return { message: messageParts.join(' '), fieldErrors };
  }

  if ((response.status ?? 0) >= 500) {
    console.error(data ?? error);
  }
  return { message: GENERIC_API_ERROR, fieldErrors: {} };
}

export function withInputError(fieldErrors: ApiFieldErrors | undefined, name: string): string {
  return fieldErrors?.[name] ? 'input input-bordered input-error' : 'input input-bordered';
}

import { io } from 'socket.io-client';

export const CYBERHUNT_TEAM_TOKEN = 'ctsoc-cyberhunt-team';
export const CYBERHUNT_ADMIN_TOKEN = 'ctsoc-cyberhunt-admin';

export async function cyberhuntRequest(path, { token, method = 'GET', body } = {}) {
  const response = await fetch(`/api/cyberhunt${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'The archive could not complete that request.');
  return payload;
}

export function connectCyberhuntSocket(token) {
  return io('/cyberhunt', {
    auth: { token },
    transports: ['websocket', 'polling'],
  });
}

export function formatCyberhuntTime(milliseconds = 0) {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}

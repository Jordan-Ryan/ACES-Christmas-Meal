import type { ResponsesData, MenuData, SubmitOrderRequest } from './types';

const API_BASE_URL = '/api';

export async function fetchResponses(): Promise<ResponsesData> {
  const response = await fetch(`${API_BASE_URL}/responses`);
  if (!response.ok) {
    throw new Error('Failed to fetch responses');
  }
  return response.json();
}

export async function fetchMenu(): Promise<MenuData> {
  const response = await fetch(`${API_BASE_URL}/menu`);
  if (!response.ok) {
    throw new Error('Failed to fetch menu');
  }
  return response.json();
}

export async function submitOrder(request: SubmitOrderRequest): Promise<ResponsesData> {
  const response = await fetch(`${API_BASE_URL}/responses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to submit order' }));
    throw new Error(error.error || 'Failed to submit order');
  }

  return response.json();
}


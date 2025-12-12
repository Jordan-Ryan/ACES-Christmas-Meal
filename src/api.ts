import type { ResponsesData, MenuData, SubmitOrderRequest, DrinkItem } from './types';

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

// Drinks management API
export async function fetchDrinks(): Promise<DrinkItem[]> {
  const response = await fetch(`${API_BASE_URL}/drinks`);
  if (!response.ok) {
    throw new Error('Failed to fetch drinks');
  }
  return response.json();
}

export async function addDrink(drink: Omit<DrinkItem, 'id'>): Promise<DrinkItem> {
  const response = await fetch(`${API_BASE_URL}/drinks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(drink),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to add drink' }));
    throw new Error(error.error || 'Failed to add drink');
  }

  return response.json();
}

export async function updateDrink(drink: DrinkItem): Promise<DrinkItem> {
  const response = await fetch(`${API_BASE_URL}/drinks/${drink.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(drink),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to update drink' }));
    throw new Error(error.error || 'Failed to update drink');
  }

  return response.json();
}

export async function deleteDrink(drinkId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/drinks/${drinkId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to delete drink' }));
    throw new Error(error.error || 'Failed to delete drink');
  }
}

export async function updatePersonExtras(personId: number, extras: { drinkId: string; quantity: number }[]): Promise<ResponsesData> {
  const response = await fetch(`${API_BASE_URL}/responses/${personId}/extras`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ extras }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to update extras' }));
    throw new Error(error.error || 'Failed to update extras');
  }

  return response.json();
}



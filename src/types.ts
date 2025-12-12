export interface AdultOrder {
  starter?: string;
  main?: string;
  sundayRoast?: string;
  sides?: string[];
  dessert?: string;
  notes?: string;
}

export interface KidsOrder {
  main?: string;
  sundayRoast?: string;
  dessert?: string;
  notes?: string;
}

export type Order = AdultOrder | KidsOrder | null;

export interface DrinkItem {
  id: string;
  name: string;
  price: number;
}

export interface ExtraItem {
  drinkId: string;
  quantity: number;
}

export interface Person {
  id: number;
  name: string;
  isChild: boolean;
  hasPaid?: boolean;
  order: Order;
  extras?: ExtraItem[]; // Drinks and extras
}

export interface ResponsesData {
  people: Person[];
}

export interface MenuItem {
  name: string;
  price: number;
}

export interface MenuData {
  snacks: MenuItem[];
  starters: MenuItem[];
  sundayRoasts: MenuItem[];
  mains: MenuItem[];
  sides: MenuItem[];
  desserts: MenuItem[];
  kidsMains: MenuItem[];
  kidsRoasts: MenuItem[];
  kidsDesserts: MenuItem[];
}

export interface SubmitOrderRequest {
  personId: number;
  order: Order;
  hasPaid?: boolean;
  notes?: string;
  extras?: ExtraItem[];
}

export interface ServiceChargeSettings {
  percentage: number;
  enabled: boolean;
}


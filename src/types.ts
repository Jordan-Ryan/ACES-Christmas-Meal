export interface AdultOrder {
  starter?: string;
  main?: string;
  sundayRoast?: string;
  sides?: string[];
  dessert?: string;
  notes?: string;
}

export interface KidsOrder {
  kidsOrder: string;
  notes?: string;
}

export type Order = AdultOrder | KidsOrder | null;

export interface Person {
  id: number;
  name: string;
  isChild: boolean;
  hasPaid?: boolean;
  depositPaid?: boolean;
  order: Order;
}

export interface ResponsesData {
  people: Person[];
}

export interface MenuData {
  snacks: string[];
  starters: string[];
  sundayRoasts: string[];
  mains: string[];
  sides: string[];
  desserts: string[];
  kidsMenu: string[];
}

export interface SubmitOrderRequest {
  personId: number;
  order: Order;
  depositPaid?: boolean;
  notes?: string;
}


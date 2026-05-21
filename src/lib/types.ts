export interface RawOrder {
  sales_order_number: string;
  customer_name: string;
  postcode: string;
  contact_name: string;
  primary_email: string | null;
  secondary_email: string | null;
  order_value: number;
  order_date: string;
}

export interface Order {
  date: Date;
  value: number;
}

export interface MonthlyComparison {
  month: string; // "Jan", "Feb", etc.
  monthIndex: number; // 0-11
  lastYearOrders: number;
  thisYearOrders: number;
  lastYearSpend: number;
  thisYearSpend: number;
}

export interface YoYComparison {
  // Full last year totals
  lastYearFullOrders: number;
  lastYearFullSpend: number;
  lastYearFullAvgOrder: number;
  // Same period last year (Jan → current month)
  lastYearOrders: number;
  lastYearSpend: number;
  lastYearAvgOrder: number;
  // This year YTD (Jan → current month)
  thisYearOrders: number;
  thisYearSpend: number;
  thisYearAvgOrder: number;
  // % change YTD vs same period last year
  orderCountChange: number;
  spendChange: number;
  avgOrderChange: number;
  monthlyBreakdown: MonthlyComparison[];
  isNewCustomer: boolean;
}

export interface Customer {
  id: string;
  name: string;
  postcode: string;
  contactName: string;
  email: string;
  customerType: 'standard' | 'volume';
  orders: Order[];
  totalSpend: number;
  totalOrders: number;
  lastOrderDate: Date;
  averageGapDays: number;
  currentGapDays: number;
  gapRatio: number;
  riskLevel: 'high' | 'medium' | 'low';
  yoyComparison: YoYComparison | null;
}

// assignments: Record<customerId, teamMemberName>
export type Assignments = Record<string, string>;

// One entry per customer that has been deactivated or has a pending deactivation request
export interface Deactivation {
  customerId: string;
  customerName: string;
  status: 'pending' | 'active';
  reason: string;
  requestedById: string;
  requestedByName: string;
  requestedAt: string; // ISO
  approvedById: string | null;
  approvedByName: string | null;
  approvedAt: string | null;
}

// Map of customerId → Deactivation (so a lookup is O(1))
export type Deactivations = Record<string, Deactivation>;

export type NotificationType =
  | 'assignment'
  | 'deactivation_request'
  | 'deactivation_approved'
  | 'deactivation_rejected';

export interface AppNotification {
  id: string;
  type: NotificationType;
  customerId: string;
  customerName: string;
  message: string;
  read: boolean;
  createdAt: string; // ISO
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export type SortField =
  | 'gapRatio'
  | 'name'
  | 'contactName'
  | 'postcode'
  | 'email'
  | 'totalOrders'
  | 'totalSpend'
  | 'lastOrderDate';

export type SortDirection = 'asc' | 'desc';

export type CustomerTypeFilter = 'standard' | 'volume';
export type RegionFilter = string; // 'all' or a specific contact name value
export type SpendFilter = 'all' | '0-999' | '1000-1999' | '2000+';
export type HideAssignedFilter = boolean;
// 'active' = hide deactivated (default), 'all' = show both, 'deactivated' = only deactivated
export type DeactivationView = 'active' | 'all' | 'deactivated';

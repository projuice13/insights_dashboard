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

// All possible customer status tags. 'active' is implicit (absence of any row).
export type CustomerStatusType =
  | 'deactivated'
  | 'dormant'
  | 'no_response'
  | 'possible'
  | 'seasonal'
  | 'hot';

// Display config for each status tag — bg/text/dot Tailwind classes are referenced
// statically here so the JIT picks them up.
export const STATUS_CONFIG: Record<
  CustomerStatusType,
  { label: string; bg: string; text: string; dot: string; ring: string }
> = {
  hot:         { label: 'Hot',         bg: 'bg-red-50',     text: 'text-red-700',     ring: 'ring-red-200',     dot: 'bg-red-500'    },
  possible:    { label: 'Possible',    bg: 'bg-blue-50',    text: 'text-blue-700',    ring: 'ring-blue-200',    dot: 'bg-blue-500'   },
  seasonal:    { label: 'Seasonal',    bg: 'bg-purple-50',  text: 'text-purple-700',  ring: 'ring-purple-200',  dot: 'bg-purple-500' },
  no_response: { label: 'No Response', bg: 'bg-amber-50',   text: 'text-amber-700',   ring: 'ring-amber-200',   dot: 'bg-amber-500'  },
  dormant:     { label: 'Dormant',     bg: 'bg-slate-50',   text: 'text-slate-700',   ring: 'ring-slate-200',   dot: 'bg-slate-500'  },
  deactivated: { label: 'Deactivated', bg: 'bg-stone-100',  text: 'text-stone-700',   ring: 'ring-stone-200',   dot: 'bg-stone-500'  },
};

// One entry per customer with a non-default status (i.e. anything other than Active)
export interface CustomerStatus {
  customerId: string;
  customerName: string;
  status: CustomerStatusType;
  approvalStatus: 'approved' | 'pending';
  reason: string | null;
  setById: string;
  setByName: string;
  setAt: string; // ISO
  approvedById: string | null;
  approvedByName: string | null;
  approvedAt: string | null;
}

// Map of customerId → CustomerStatus (so a lookup is O(1))
export type CustomerStatuses = Record<string, CustomerStatus>;

export type NotificationType =
  | 'assignment'
  | 'deactivation_request'
  | 'deactivation_approved'
  | 'deactivation_rejected'
  | 'auto_reactivated';

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

// Status filter: a Set of statuses that should appear in the list. 'active' represents
// customers with no status row (the default tag). Default value when nothing filtered:
// every status selected EXCEPT 'deactivated'.
export type StatusFilterValue = 'active' | CustomerStatusType;

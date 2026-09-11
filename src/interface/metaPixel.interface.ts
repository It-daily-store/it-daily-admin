export type TContentIdSource = "sku" | "_id" | "slug";

export type TSentEventStatus = "queued" | "sent" | "failed" | "dead";

export type TMetaPixelTrigger = {
  key: string;
  eventName: string;
  isCustomEvent: boolean;
  enabled: boolean;
  sendViaBrowser: boolean;
  sendViaCapi: boolean;
};

export type TMetaPixelStatusRule = {
  _id?: string;
  status: string;
  eventName: string;
  isCustomEvent: boolean;
  enabled: boolean;
};

export type TMetaPixelConfig = {
  _id: string;
  pixelId?: string;
  datasetId?: string;
  testEventCode?: string;
  hasToken: boolean;
  tokenLast4?: string;
  tokenVerifiedAt?: string;
  enabled: boolean;
  capiEnabled: boolean;
  currency: string;
  contentIdSource: TContentIdSource;
  contentType: string;
  excludedIps: string[];
  blockBots: boolean;
  triggers: TMetaPixelTrigger[];
  statusRules: TMetaPixelStatusRule[];
  updatedAt: string;
};

export type TMetaPixelLog = {
  _id: string;
  eventName: string;
  eventId: string;
  source: "browser_backup" | "status_rule" | "manual" | "test_connection";
  orderId?: { _id: string; orderNumber: string };
  triggerKey?: string;
  payload: Record<string, unknown>;
  status: TSentEventStatus;
  attempts: number;
  httpStatus?: number;
  metaResponse?: Record<string, unknown>;
  fbtraceId?: string;
  errorMessage?: string;
  createdAt: string;
};

export type TMetaPixelSentEvent = {
  eventName: string;
  eventId: string;
  status: TSentEventStatus;
  attempts: number;
  sentAt?: string;
  fbtraceId?: string;
  errorMessage?: string;
};

export type TOrderTrackingData = {
  sentEvents?: TMetaPixelSentEvent[];
};

export type TTestConnectionResult = {
  ok: boolean;
  httpStatus?: number;
  fbtraceId?: string;
  errorMessage?: string;
  response?: Record<string, unknown>;
  testEventCode: string | null;
  tokenVerifiedAt?: string;
};

// Mirrors BE metaPixel.constants.ts. Labels live here so the admin table reads
// well without a round trip; the keys must match the backend registry exactly.
export const TRIGGER_LABELS: Record<
  string,
  { label: string; description: string; backendVisible: boolean }
> = {
  page_view: {
    label: "Any page view",
    description: "Fires on every storefront route change.",
    backendVisible: false,
  },
  product_view: {
    label: "Product detail page",
    description: "A customer opens a single product page.",
    backendVisible: false,
  },
  category_view: {
    label: "Category listing page",
    description: "A customer opens a category or brand listing.",
    backendVisible: false,
  },
  search: {
    label: "Search performed",
    description: "A customer submits a search query.",
    backendVisible: false,
  },
  add_to_cart: {
    label: "Add to cart",
    description: "A product is added to the cart.",
    backendVisible: true,
  },
  cart_view: {
    label: "Cart page",
    description: "A customer opens the cart page.",
    backendVisible: false,
  },
  wishlist_add: {
    label: "Add to wishlist",
    description: "A product is saved to the wishlist.",
    backendVisible: false,
  },
  compare_add: {
    label: "Add to compare",
    description: "A product is added to the compare list.",
    backendVisible: false,
  },
  checkout_start: {
    label: "Checkout started",
    description: "A customer reaches the checkout page.",
    backendVisible: true,
  },
  checkout_success: {
    label: "Order placed",
    description: "An order is created successfully.",
    backendVisible: true,
  },
  signup: {
    label: "Account created",
    description: "A customer completes registration.",
    backendVisible: true,
  },
  login: {
    label: "Login",
    description: "A customer signs in.",
    backendVisible: true,
  },
  pc_builder_save: {
    label: "PC build saved",
    description: "A customer saves a PC build.",
    backendVisible: true,
  },
  contact_submit: {
    label: "Contact form submitted",
    description: "A customer submits a contact or enquiry form.",
    backendVisible: true,
  },
};

export const META_STANDARD_EVENTS = [
  "AddPaymentInfo",
  "AddToCart",
  "AddToWishlist",
  "CompleteRegistration",
  "Contact",
  "CustomizeProduct",
  "Donate",
  "FindLocation",
  "InitiateCheckout",
  "Lead",
  "PageView",
  "Purchase",
  "Schedule",
  "Search",
  "StartTrial",
  "SubmitApplication",
  "Subscribe",
  "ViewContent",
];

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
];

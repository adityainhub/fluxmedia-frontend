// Loads Razorpay Checkout and opens the subscription payment modal.

interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  subscription_id: string;
  name: string;
  description?: string;
  image?: string;
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: { ondismiss?: () => void };
  prefill?: { name?: string; email?: string };
  theme?: { color?: string };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

const SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

let loading: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loading = null;
      reject(new Error("Failed to load the payment window. Check your connection and try again."));
    };
    document.body.appendChild(script);
  });
  return loading;
}

export async function openRazorpayCheckout(opts: {
  keyId: string;
  subscriptionId: string;
  planName: string;
  userName?: string;
  userEmail?: string;
  onSuccess: (response: {
    razorpayPaymentId: string;
    razorpaySubscriptionId: string;
    razorpaySignature: string;
  }) => void;
  onDismiss?: () => void;
}): Promise<void> {
  await loadScript();
  if (!window.Razorpay) throw new Error("Payment window unavailable");

  const razorpay = new window.Razorpay({
    key: opts.keyId,
    subscription_id: opts.subscriptionId,
    name: "fluxmedia",
    description: `${opts.planName} plan — monthly subscription`,
    handler: (response) =>
      opts.onSuccess({
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySubscriptionId: response.razorpay_subscription_id,
        razorpaySignature: response.razorpay_signature,
      }),
    modal: { ondismiss: opts.onDismiss },
    prefill: { name: opts.userName, email: opts.userEmail },
    theme: { color: "#f43f4e" },
  });
  razorpay.open();
}

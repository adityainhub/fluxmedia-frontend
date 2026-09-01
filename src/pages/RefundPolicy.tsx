import { LegalPage, LegalSection } from "@/components/LegalPage";
import { LEGAL } from "@/lib/legal";

const sections: LegalSection[] = [
  {
    heading: "Summary",
    body: [
      "You can cancel a paid plan at any time, keep using it until the end of the period you have already paid for, and then move to the Free plan automatically. We do not lock you into a contract or charge a cancellation fee.",
      "Because plans are billed monthly and the service is delivered immediately, we do not refund partial months as a matter of course — but the exceptions below are real, and we would rather sort out a genuine problem than keep money we have not earned.",
    ],
  },
  {
    heading: "How billing works",
    body: [
      "Paid plans (Creator and Scale) are billed monthly in advance through Razorpay. Each payment covers the month ahead. The Free plan costs nothing, requires no card, and has nothing to cancel.",
      "Upgrading takes effect as soon as payment is confirmed, and your new limits apply immediately.",
    ],
  },
  {
    heading: "Cancelling a subscription",
    bullets: [
      "Cancel from the console at any time: go to Usage & Billing and choose to downgrade to the Free plan.",
      "Cancellation takes effect at the end of your current billing period. You keep your paid limits until that date — we do not cut off access the moment you cancel.",
      "After that date your account moves to the Free plan. No further payments are taken.",
      `If you cannot access the console, email ${LEGAL.supportEmail} or call ${LEGAL.phoneDisplay} and we will cancel it for you.`,
    ],
  },
  {
    heading: "What happens to your videos after downgrading",
    body: [
      "Your existing videos are not deleted when you move to the Free plan. They remain stored and playable.",
      "New uploads will follow Free plan limits, so if your stored content exceeds the Free storage allowance you will need to delete some videos before uploading more. We will not delete your content to make it fit.",
    ],
  },
  {
    heading: "When we will refund you",
    body: ["We will issue a full or partial refund in these situations:"],
    bullets: [
      "Within 7 days of your first payment on a paid plan, if the Service does not work as described and we cannot fix it for you.",
      "A duplicate or accidental charge — for example being billed twice for the same month.",
      "A charge taken after you cancelled, or after your account was closed.",
      "A prolonged outage on our side that prevented you from using the Service for a significant part of a billing period.",
    ],
  },
  {
    heading: "When we generally will not refund",
    bullets: [
      "Partial months after the 7-day window, where the Service worked as described and you simply stopped using it.",
      "Quota you have already consumed — videos transcoded and stored during the period.",
      "Accounts suspended or terminated for breaching our Terms & Conditions.",
      "Problems caused by factors outside the Service, such as your own network, source files that are corrupt or unsupported, or content you deleted yourself.",
    ],
  },
  {
    heading: "How to request a refund",
    body: [
      `Email ${LEGAL.supportEmail} with the email address on your account, the approximate date and amount of the charge, and a short description of the problem. You can also call ${LEGAL.phoneDisplay} during ${LEGAL.supportHours}.`,
      "We aim to respond within 2 business days and to decide on refund requests within 7 business days. Approved refunds are returned to the original payment method through Razorpay, and typically appear within 5–7 business days depending on your bank or card issuer.",
      "If we decline a request, we will explain why.",
    ],
  },
  {
    heading: "Failed payments",
    body: [
      "If a renewal payment fails, Razorpay may retry it. If it remains unpaid, the subscription ends and your account moves to the Free plan. You will not be charged for a period you did not receive access to, and you can resubscribe at any time.",
    ],
  },
];

const RefundPolicy = () => (
  <LegalPage
    title="Refund & Cancellation Policy"
    intro="How to cancel a subscription, what happens to your content afterwards, and when we will refund a payment."
    sections={sections}
  />
);

export default RefundPolicy;

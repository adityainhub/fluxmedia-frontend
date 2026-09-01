// Display copy for the subscription tiers. Limits mirror backend
// com.streaming.app.model.Plan — the backend is the enforcement point.

export interface PlanInfo {
  id: "FREE" | "CREATOR" | "SCALE";
  name: string;
  priceMonthly: number;
  tagline: string;
  videosPerMonth: number;
  maxFileSize: string;
  storage: string;
  features: string[];
  highlighted?: boolean;
}

export const PLANS: PlanInfo[] = [
  {
    id: "FREE",
    name: "Free",
    priceMonthly: 0,
    tagline: "Try the full pipeline, on us",
    videosPerMonth: 10,
    maxFileSize: "500 MB",
    storage: "2 GB",
    features: [
      "10 videos / month",
      "500 MB max file size",
      "2 GB storage",
      "Full HLS quality ladder",
      "HLS adaptive streaming",
      "Community support",
    ],
  },
  {
    id: "CREATOR",
    name: "Creator",
    priceMonthly: 19,
    tagline: "For creators and small teams",
    videosPerMonth: 100,
    maxFileSize: "2 GB",
    storage: "50 GB",
    highlighted: true,
    features: [
      "100 videos / month",
      "2 GB max file size",
      "50 GB storage",
      "Full HLS quality ladder",
      "Developer API access",
      "Email support",
    ],
  },
  {
    id: "SCALE",
    name: "Scale",
    priceMonthly: 99,
    tagline: "For products with real volume",
    videosPerMonth: 1000,
    maxFileSize: "10 GB",
    storage: "500 GB",
    features: [
      "1,000 videos / month",
      "10 GB max file size",
      "500 GB storage",
      "Full HLS quality ladder",
      "Developer API access",
      "Priority support",
    ],
  },
];

import { LegalPage, LegalSection } from "@/components/LegalPage";
import { LEGAL } from "@/lib/legal";

const sections: LegalSection[] = [
  {
    heading: "Scope",
    body: [
      `This policy explains what personal data ${LEGAL.serviceName}, operated by ${LEGAL.legalEntityName} at ${LEGAL.address}, collects when you use ${LEGAL.websiteLabel}, why we collect it, who we share it with, and the choices you have. We handle personal data in line with applicable Indian law, including the Digital Personal Data Protection Act, 2023.`,
    ],
  },
  {
    heading: "What we collect",
    body: ["We collect only what the Service needs to function:"],
    bullets: [
      "Account details — your name and email address. Your password is stored only as a bcrypt hash; we cannot read it, and nobody at our end can tell you what it is.",
      "Content you upload — your video files and the metadata we derive from them, such as file name, size, duration and source resolution.",
      "Usage data — how many videos you have processed this month and how much storage you are using, so plan limits can be enforced and shown to you.",
      "Billing data — your subscription identifier and status from Razorpay. Card numbers, UPI IDs and bank details are collected and processed by Razorpay directly; they never reach our servers.",
      "Technical logs — IP address, request paths, timestamps and error details. These are used to operate the Service, diagnose faults, and rate-limit sign-in attempts to protect accounts from brute-force attacks.",
    ],
  },
  {
    heading: "How we use it",
    body: ["We use the data above to:"],
    bullets: [
      "Create and secure your account, and verify your email address.",
      "Transcode, store and deliver your videos, including generating the playback links you and anyone you share with will use.",
      "Enforce plan limits and process subscription payments.",
      "Send transactional email — verification, password resets and billing notices. We do not send marketing email.",
      "Investigate faults, abuse and security incidents.",
    ],
    // Deliberately not listed because we do not do them: advertising, profiling,
    // selling data, or training models on customer content.
  },
  {
    heading: "What we never do",
    body: [
      "We do not sell your personal data or your content. We do not share it with advertisers, use it to build advertising profiles, or use your uploaded videos to train machine learning models. We do not watch your videos except where strictly necessary to investigate a specific abuse report or a fault you have asked us to fix.",
    ],
  },
  {
    heading: "Who processes data on our behalf",
    body: [
      "The Service runs on infrastructure operated by third parties, who process data only to provide their service to us:",
    ],
    bullets: [
      "Amazon Web Services — video storage, queueing and the transcoding compute that produces your renditions.",
      "Microsoft Azure — hosting for the application and database.",
      "Razorpay — payment processing for paid plans, subject to Razorpay's own privacy policy.",
      "Our email provider — delivery of verification, password reset and contact-form email.",
      "Vercel — serving the website and console front end.",
    ],
  },
  {
    heading: "Where your data is stored",
    body: [
      "Your content and account data are stored on servers operated by the providers above, which may be located outside India. Where data is transferred internationally, we rely on the contractual protections offered by those providers. If you need processing confined to a particular region, contact us before uploading.",
    ],
  },
  {
    heading: "How long we keep it",
    bullets: [
      "Original uploads are deleted automatically once transcoding succeeds — only the processed renditions are retained.",
      "Renditions and video metadata are kept until you delete the video or close your account. Deleting a video removes its stored files as well as its database record.",
      "Account data is kept while your account is open, and is deleted on request when you close it.",
      "Billing records are retained for as long as tax and accounting law requires, even after account closure.",
      "Technical logs are retained only as long as needed for troubleshooting and security.",
    ],
  },
  {
    heading: "How we protect it",
    bullets: [
      "All traffic between your browser and our servers is encrypted over HTTPS.",
      "Passwords are stored as bcrypt hashes, never in plain text. API keys are stored as SHA-256 hashes and shown to you only once, at creation.",
      "Videos are private by default. Playback and download links are short-lived, signed and scoped to a single video.",
      "Uploads go directly from your browser to storage using a time-limited signed URL, so your file never passes through our application servers.",
      "No system is perfectly secure. If a breach affects your personal data, we will notify you and the relevant authority as required by law.",
    ],
  },
  {
    heading: "Cookies and browser storage",
    body: [
      "We do not use advertising or analytics cookies, and we do not track you across other websites.",
      "When you sign in, your session token is stored in your browser's local storage so you stay signed in between visits. Signing out removes it. Clearing your browser's site data will also sign you out.",
    ],
  },
  {
    heading: "Your rights",
    body: [
      `You can access and correct your name and email from the console, download your processed videos at any time, and delete any video yourself. To request a full copy of your data, correct something you cannot change yourself, or have your account and data erased, email ${LEGAL.supportEmail}. We will respond within 30 days.`,
      "You may also withdraw consent or complain to the relevant data protection authority if you believe we have mishandled your data.",
    ],
  },
  {
    heading: "Children",
    body: [
      "The Service is not directed at children under 18. We do not knowingly collect personal data from children. If you believe a child has created an account, contact us and we will remove it.",
    ],
  },
  {
    heading: "Changes to this policy",
    body: [
      "We will update this page when our practices change, and revise the date at the top. If a change materially affects how we handle your personal data, we will tell you by email before it takes effect.",
    ],
  },
];

const Privacy = () => (
  <LegalPage
    title="Privacy Policy"
    intro={`What data ${LEGAL.serviceName} collects, why, who processes it, and how you stay in control of it.`}
    sections={sections}
  />
);

export default Privacy;

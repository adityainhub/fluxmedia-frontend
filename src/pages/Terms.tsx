import { LegalPage, LegalSection } from "@/components/LegalPage";
import { LEGAL } from "@/lib/legal";

const sections: LegalSection[] = [
  {
    heading: "Who we are and what these terms cover",
    body: [
      `${LEGAL.serviceName} ("we", "us") is operated by ${LEGAL.legalEntityName}, at ${LEGAL.address}. These Terms & Conditions govern your use of ${LEGAL.websiteLabel} and the video transcoding, hosting, playback and sharing services offered through it (the "Service").`,
      "By creating an account, uploading content, or making a payment, you agree to these terms. If you do not agree, please do not use the Service.",
    ],
  },
  {
    heading: "Eligibility and your account",
    body: [
      "You must be at least 18 years old, or using the Service under the supervision of a parent or legal guardian who accepts these terms on your behalf.",
      "You are responsible for everything that happens under your account:",
    ],
    bullets: [
      "Keep your password confidential and use a password you do not reuse elsewhere.",
      "Treat API keys as secrets. Anyone holding a key can upload, read and delete content on your account. Revoke a key immediately from the console if it is exposed.",
      "Tell us promptly at " + LEGAL.supportEmail + " if you believe your account has been accessed without your permission.",
      "Provide accurate account information and keep your email address current, since we use it for verification, password resets and billing notices.",
    ],
  },
  {
    heading: "Your content stays yours",
    body: [
      "You retain all ownership of the videos and other material you upload (\"Your Content\"). We claim no ownership over it.",
      "To operate the Service, you grant us a limited, non-exclusive, worldwide, royalty-free licence to store, transcode, encode, reformat, cache and transmit Your Content — solely to provide the Service to you and to anyone you choose to share it with. This licence exists only so the pipeline can function, ends when you delete the content or close your account, and does not permit us to use Your Content for marketing, training, or any purpose you have not asked for.",
      "You confirm that you own Your Content or otherwise hold the rights necessary to upload and distribute it, including rights to any music, footage or trademarks it contains.",
    ],
  },
  {
    heading: "Acceptable use",
    body: ["You agree not to use the Service to upload, process, store or share content that:"],
    bullets: [
      "Infringes anyone's copyright, trademark, privacy, publicity or other rights.",
      "Is unlawful under Indian law, including content that is obscene, defamatory, or depicts or promotes child sexual abuse, terrorism or violence.",
      "Contains malware, or is used to attack, probe or overload our systems or anyone else's.",
      "Is intended to circumvent plan limits — for example by creating multiple accounts to obtain additional free quota, or by automating signups.",
      "You also agree not to resell or white-label the Service as your own without our written permission.",
    ],
  },
  {
    heading: "Plans, limits and payment",
    body: [
      "The Service is offered on a Free plan and on paid Creator and Scale plans. Each plan sets a monthly limit on the number of videos, a maximum file size, and a total storage allowance. Current limits are shown on the Pricing page and in your console.",
      "Paid plans are billed monthly in advance through our payment partner, Razorpay. Card and payment details are handled entirely by Razorpay; we never see or store your full card number.",
      "Limits are enforced automatically. When you reach a limit, further uploads are declined until the next billing month begins, you delete content to free storage, or you upgrade. Cancellation and refunds are covered in our Refund & Cancellation Policy.",
    ],
  },
  {
    heading: "Sharing and public links",
    body: [
      "Videos are private by default. If you enable sharing on a video, anyone holding the generated link can watch or embed it without signing in — the link itself is the access credential, so treat it accordingly.",
      "You are solely responsible for what you choose to make public and for where you embed it. Disabling sharing revokes the link immediately, and re-enabling it later produces a different link.",
    ],
  },
  {
    heading: "Availability and support",
    body: [
      "We work to keep the Service running reliably, but we do not currently offer a contractual uptime guarantee or service level agreement. The Service may be unavailable during maintenance, third-party provider outages, or circumstances beyond our reasonable control.",
      `Support is provided by email at ${LEGAL.supportEmail} and by phone at ${LEGAL.phoneDisplay} during ${LEGAL.supportHours}. Paid plans receive priority.`,
      "Processing times vary with the length and resolution of your source file and with how many jobs are queued ahead of yours.",
    ],
  },
  {
    heading: "Suspension and termination",
    body: [
      "You may stop using the Service and delete your content at any time. To close your account entirely, email us.",
      "We may suspend or terminate an account that breaches these terms, that is being used unlawfully, or where payment has failed and remains unresolved. Where it is reasonable and lawful to do so, we will contact you first and give you an opportunity to correct the problem.",
      "On termination, your content may be permanently deleted. Please keep your own copies of anything you need — the Service is not a backup service.",
    ],
  },
  {
    heading: "Limitation of liability",
    body: [
      "The Service is provided on an \"as is\" and \"as available\" basis. To the fullest extent permitted by law, we exclude implied warranties of merchantability and fitness for a particular purpose.",
      "We are not liable for indirect, incidental or consequential loss, or for loss of profits, revenue, data or goodwill. Where liability cannot lawfully be excluded, our total liability for any claim is limited to the amount you paid us for the Service in the three months immediately before the event giving rise to the claim.",
      "Nothing in these terms limits liability for fraud, or for anything else that cannot be limited under applicable law.",
    ],
  },
  {
    heading: "Changes to these terms",
    body: [
      "We may update these terms as the Service evolves. If a change materially affects your rights, we will notify you by email or through the console before it takes effect. Continuing to use the Service after that point means you accept the updated terms.",
    ],
  },
  {
    heading: "Governing law",
    body: [
      `These terms are governed by the laws of ${LEGAL.jurisdictionCountry}. The courts at ${LEGAL.jurisdictionCity}, ${LEGAL.jurisdictionCountry} have exclusive jurisdiction over any dispute arising from them.`,
      "We would much rather resolve problems directly, so please contact us before pursuing any formal action.",
    ],
  },
];

const Terms = () => (
  <LegalPage
    title="Terms & Conditions"
    intro={`The agreement between you and ${LEGAL.serviceName} covering accounts, content, plans, and acceptable use of the Service.`}
    sections={sections}
  />
);

export default Terms;

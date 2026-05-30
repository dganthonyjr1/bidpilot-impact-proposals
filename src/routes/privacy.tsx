import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Bidpilot" },
      { name: "description", content: "Bidpilot Privacy Policy." },
      { name: "robots", content: "index,follow" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-display font-bold text-lg">Bidpilot</Link>
          <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">Terms</Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="font-display text-4xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        <div className="mt-6 rounded-md border border-yellow-500/40 bg-yellow-500/10 p-4 text-sm text-yellow-200">
          <strong>[LEGAL REVIEW PENDING]</strong> — This document is placeholder text intended to satisfy
          Stripe Connect onboarding requirements. It must be reviewed and finalized by a qualified attorney
          before relying on it for production legal protection.
        </div>

        <section className="mt-8 space-y-6 text-sm leading-relaxed text-foreground/90">
          <div>
            <h2 className="font-display text-xl font-semibold">1. Information We Collect</h2>
            <p>We collect account information (name, email, business name, phone), proposal content created by contractors, contact information for end clients (name, email, phone, job address), and technical data (IP address, user agent, viewed timestamps) needed to operate the Service.</p>
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">2. How We Use Information</h2>
            <p>To provide the Service, generate proposals, deliver email and SMS notifications, process payments via third-party processors, prevent fraud and abuse, and improve product quality.</p>
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">3. Sharing</h2>
            <p>We share data with infrastructure providers strictly as required to operate the Service, including: Supabase (database/auth), Cloudflare (hosting/CDN), Twilio and GoHighLevel (SMS), our email delivery provider, Retell AI (voice intake when used), Anthropic and Google (AI generation), and Stripe (payments). We do not sell personal information.</p>
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">4. End-Client Data</h2>
            <p>Contractors are the data controllers for their end-client information. Bidpilot acts as a processor for that data and only uses it to deliver the Service to the contractor.</p>
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">5. Email and SMS</h2>
            <p>By providing a phone number or email address, the recipient consents to receive transactional messages relating to the proposal. Recipients may unsubscribe from email via the link in any message or reply STOP to SMS.</p>
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">6. Data Retention</h2>
            <p>We retain account and proposal data for as long as the account is active. You may request deletion of your account and associated data at any time.</p>
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">7. Security</h2>
            <p>We use industry-standard safeguards including TLS in transit, encrypted storage at rest, and Row-Level Security policies to protect your data. No system is perfectly secure.</p>
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">8. Your Rights</h2>
            <p>Depending on your jurisdiction you may have rights to access, correct, delete, or port your data. Contact us to exercise those rights.</p>
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">9. Children</h2>
            <p>The Service is not intended for individuals under 18.</p>
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">10. Contact</h2>
            <p>Questions about this Policy: <a href="mailto:privacy@suddenimpactagency.io" className="underline">privacy@suddenimpactagency.io</a>.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
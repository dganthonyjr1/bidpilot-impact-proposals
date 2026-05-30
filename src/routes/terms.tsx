import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Bidpilot" },
      { name: "description", content: "Bidpilot Terms of Service." },
      { name: "robots", content: "index,follow" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-display font-bold text-lg">Bidpilot</Link>
          <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">Privacy</Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-12 prose prose-invert">
        <h1 className="font-display text-4xl font-bold tracking-tight">Terms of Service</h1>
        <p className="text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        <div className="mt-6 rounded-md border border-yellow-500/40 bg-yellow-500/10 p-4 text-sm text-yellow-200">
          <strong>[LEGAL REVIEW PENDING]</strong> — This document is placeholder text intended to satisfy
          Stripe Connect onboarding requirements. It must be reviewed and finalized by a qualified attorney
          before relying on it for production legal protection.
        </div>

        <section className="mt-8 space-y-6 text-sm leading-relaxed text-foreground/90">
          <div>
            <h2 className="font-display text-xl font-semibold">1. Acceptance of Terms</h2>
            <p>By accessing or using Bidpilot (the "Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">2. Service Description</h2>
            <p>Bidpilot provides AI-generated proposal and estimate tools for contractors, including delivery of those documents to end clients via email and SMS, e-signature capture, and integration with third-party payment providers.</p>
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">3. Account Responsibilities</h2>
            <p>You are responsible for all activity that occurs under your account. You agree to provide accurate information and to keep your credentials secure.</p>
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">4. Payments and Fees</h2>
            <p>Subscription fees, payment processing fees (via Stripe Connect or other providers), and any additional usage-based charges are billed as described on our pricing page. Fees are non-refundable except where required by law.</p>
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">5. Contractor / Client Relationship</h2>
            <p>Bidpilot is a software platform. It is not a party to any agreement between a contractor and their end client. Contractors are solely responsible for the accuracy of proposals, the work performed, warranties offered, and compliance with applicable law.</p>
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">6. Acceptable Use</h2>
            <p>You may not use the Service to send unsolicited messages, transmit malicious code, or violate any applicable law including the TCPA, CAN-SPAM, or state consumer protection laws.</p>
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">7. Disclaimers</h2>
            <p>The Service is provided "as is" without warranties of any kind. AI-generated content may contain errors and should be reviewed before delivery to clients.</p>
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">8. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Bidpilot's total liability for any claim shall not exceed the amount paid by you to Bidpilot in the twelve (12) months preceding the claim.</p>
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">9. Termination</h2>
            <p>We may suspend or terminate your access for violation of these Terms. You may cancel your account at any time.</p>
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">10. Contact</h2>
            <p>Questions about these Terms: <a href="mailto:legal@suddenimpactagency.io" className="underline">legal@suddenimpactagency.io</a>.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Bidpilot" },
      { name: "description", content: "Bidpilot Privacy Policy for contractors, proposal recipients, and platform users." },
      { name: "robots", content: "index,follow" },
    ],
  }),
  component: PrivacyPage,
});

const effectiveDate = "June 1, 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-xl font-semibold text-foreground">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-foreground/90">{children}</div>
    </section>
  );
}

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
        <p className="text-muted-foreground mt-2">Effective date: {effectiveDate}</p>

        <div className="mt-8 rounded-lg border border-border/60 bg-card/60 p-5 text-sm leading-relaxed text-muted-foreground">
          This Privacy Policy explains how Bidpilot collects, uses, discloses, and protects information when contractors,
          customers, proposal recipients, website visitors, and other users access or use the Service.
        </div>

        <div className="mt-10 space-y-8">
          <Section title="1. Overview">
            <p>
              Bidpilot provides contractor proposal and estimate software. This Policy applies to information processed through
              Bidpilot&apos;s website, application, proposal pages, estimate pages, media upload tools, AI-assisted drafting features,
              voice intake workflows, communications features, and related services.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <p>
              Bidpilot may collect account information, contractor business information, customer contact information, proposal
              and estimate details, job address information, pricing and scope information, photos, videos, uploaded media,
              voice-call intake data, message delivery data, acceptance data, support communications, device information, usage
              logs, IP addresses, browser data, and similar technical information.
            </p>
          </Section>

          <Section title="3. Information Contractors Provide About Customers">
            <p>
              Contractors may enter customer names, email addresses, phone numbers, job addresses, project details, photos,
              videos, and communication preferences. Contractors are responsible for providing any required notices and obtaining
              any required consents from their customers before entering customer information into Bidpilot or sending
              communications through the Service.
            </p>
          </Section>

          <Section title="4. Voice, AI, and Automated Processing">
            <p>
              When voice intake, AI generation, or automated proposal creation is used, Bidpilot may process call transcripts,
              summaries, job details, uploaded media, project descriptions, and contractor instructions to generate proposal or
              estimate content. This processing may involve third-party AI and voice providers. AI output should be reviewed by
              the contractor before use.
            </p>
          </Section>

          <Section title="5. Photos, Videos, and Media Uploads">
            <p>
              Uploaded media may include images or videos of job sites, property conditions, materials, damage, customer
              property, and related project details. Uploaded media may be stored and displayed in proposal pages, estimate pages,
              PDFs, or related contractor workflows. Contractors should avoid uploading unnecessary personal information or
              sensitive content.
            </p>
          </Section>

          <Section title="6. How We Use Information">
            <p>
              Bidpilot uses information to provide and operate the Service, authenticate accounts, generate proposals and
              estimates, store and display proposal content, deliver email and SMS messages, process voice intake, support
              AI-assisted drafting, track proposal views and acceptance, maintain security, prevent abuse, troubleshoot errors,
              provide support, comply with legal obligations, and improve the Service.
            </p>
          </Section>

          <Section title="7. How We Share Information">
            <p>
              Bidpilot may share information with vendors and service providers that help operate the Service, including hosting,
              database, authentication, storage, communications, voice processing, AI processing, payment processing, analytics,
              monitoring, and support providers. Bidpilot may also share information when required by law, to protect rights and
              safety, to investigate abuse, in connection with a business transfer, or with the contractor&apos;s direction.
            </p>
            <p>
              Bidpilot does not sell personal information for money. Bidpilot does not knowingly use customer contact information
              submitted by contractors for unrelated third-party marketing.
            </p>
          </Section>

          <Section title="8. Email and SMS Communications">
            <p>
              Bidpilot may process email addresses, phone numbers, message content, delivery status, opt-out signals, and related
              metadata to send proposal-related and account-related communications. Contractors are responsible for ensuring
              appropriate consent for messages they initiate. Recipients may opt out of SMS where supported by replying STOP.
            </p>
          </Section>

          <Section title="9. Cookies and Similar Technologies">
            <p>
              Bidpilot may use cookies, local storage, session storage, and similar technologies for authentication, security,
              preferences, analytics, and application functionality. Users can adjust browser settings to restrict certain
              technologies, but some features may not work properly.
            </p>
          </Section>

          <Section title="10. Data Retention">
            <p>
              Bidpilot retains information for as long as reasonably necessary to provide the Service, maintain records, comply
              with legal obligations, resolve disputes, enforce agreements, and support legitimate business needs. Contractors may
              request deletion of account information, subject to legal, security, backup, and operational limitations.
            </p>
          </Section>

          <Section title="11. Security">
            <p>
              Bidpilot uses reasonable administrative, technical, and organizational safeguards designed to protect information.
              No internet-based service can guarantee perfect security. Users should protect their credentials, limit unnecessary
              sensitive data, and notify Bidpilot of suspected unauthorized access.
            </p>
          </Section>

          <Section title="12. Data Rights and Choices">
            <p>
              Depending on location, users may have rights to access, correct, delete, restrict, or receive a copy of certain
              personal information. Contractors may also update certain account and business information directly in the Service.
              Requests may be submitted to <a href="mailto:privacy@suddenimpactagency.io" className="underline">privacy@suddenimpactagency.io</a>.
            </p>
          </Section>

          <Section title="13. State Privacy Rights">
            <p>
              Some U.S. state privacy laws provide additional rights for residents of those states. Where applicable, Bidpilot
              will honor requests to access, correct, delete, or opt out of certain processing as required by law. Bidpilot does
              not discriminate against users for exercising lawful privacy rights.
            </p>
          </Section>

          <Section title="14. Children’s Privacy">
            <p>
              Bidpilot is intended for contractors, businesses, and adult users. The Service is not intended for children under
              18, and Bidpilot does not knowingly collect personal information from children under 13.
            </p>
          </Section>

          <Section title="15. International Users">
            <p>
              Bidpilot is intended primarily for use in the United States. If you access the Service from outside the United
              States, your information may be processed in the United States or other countries where service providers operate.
            </p>
          </Section>

          <Section title="16. Changes to This Privacy Policy">
            <p>
              Bidpilot may update this Privacy Policy from time to time. The updated version will be posted with a new effective
              date. Continued use of the Service after a policy update means the updated policy applies to future use.
            </p>
          </Section>

          <Section title="17. Contact">
            <p>
              Questions or privacy requests may be sent to <a href="mailto:privacy@suddenimpactagency.io" className="underline">privacy@suddenimpactagency.io</a>.
            </p>
          </Section>
        </div>
      </main>
    </div>
  );
}

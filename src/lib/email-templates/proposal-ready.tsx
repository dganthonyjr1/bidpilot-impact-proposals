import * as React from 'react'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

interface ProposalReadyProps {
  clientName?: string
  businessName?: string
  proposalNumber?: string
  jobAddress?: string
  tradeType?: string
  totalAmount?: string
  proposalUrl?: string
}

const ProposalReadyEmail = ({
  clientName,
  businessName,
  proposalNumber,
  jobAddress,
  tradeType,
  totalAmount,
  proposalUrl,
}: ProposalReadyProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>
      {businessName ? `${businessName} sent you a proposal` : 'Your proposal is ready'}
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {clientName ? `Hi ${clientName},` : 'Hello,'}
        </Heading>
        <Text style={text}>
          {businessName ? <strong>{businessName}</strong> : 'Your contractor'} has
          prepared a detailed{tradeType ? ` ${tradeType.toLowerCase()}` : ''} proposal
          for your review.
        </Text>

        <Section style={card}>
          {proposalNumber && (
            <Text style={cardRow}>
              <span style={cardLabel}>Proposal #</span>
              <span style={cardValue}>{proposalNumber}</span>
            </Text>
          )}
          {jobAddress && (
            <Text style={cardRow}>
              <span style={cardLabel}>Job address</span>
              <span style={cardValue}>{jobAddress}</span>
            </Text>
          )}
          {totalAmount && (
            <Text style={cardRow}>
              <span style={cardLabel}>Estimated total</span>
              <span style={{ ...cardValue, fontWeight: 700 }}>{totalAmount}</span>
            </Text>
          )}
        </Section>

        {proposalUrl && (
          <Section style={{ textAlign: 'center', margin: '32px 0' }}>
            <Button href={proposalUrl} style={button}>
              View your proposal
            </Button>
          </Section>
        )}

        <Text style={text}>
          The proposal includes three tier options (Good, Better, Best) so you can
          choose what fits your needs and budget. You can e-sign directly from the
          page when you're ready to move forward.
        </Text>

        <Hr style={hr} />
        <Text style={footer}>
          Questions? Just reply to this email and {businessName || 'your contractor'}{' '}
          will get back to you.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ProposalReadyEmail,
  subject: (data: Record<string, any>) =>
    data.businessName
      ? `${data.businessName} sent you a proposal${data.proposalNumber ? ` (${data.proposalNumber})` : ''}`
      : 'Your proposal is ready',
  displayName: 'Proposal ready',
  previewData: {
    clientName: 'Jane',
    businessName: 'Sudden Impact Agency',
    proposalNumber: 'SIA-1234-5678',
    jobAddress: '245 Oak Street, Cape May, NJ',
    tradeType: 'Flooring',
    totalAmount: '$8,420.00',
    proposalUrl: 'https://example.com/p/demo',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = { fontSize: '22px', fontWeight: 700, color: '#0f172a', margin: '0 0 16px' }
const text = { fontSize: '14px', color: '#334155', lineHeight: '1.6', margin: '0 0 16px' }
const card = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '16px 18px',
  margin: '20px 0',
}
const cardRow = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '13px',
  color: '#475569',
  margin: '6px 0',
}
const cardLabel = { color: '#64748b' }
const cardValue = { color: '#0f172a', fontWeight: 500 as const }
const button = {
  backgroundColor: '#EC4899',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 600,
  padding: '12px 24px',
  borderRadius: '8px',
  textDecoration: 'none',
}
const hr = { borderColor: '#e2e8f0', margin: '28px 0 16px' }
const footer = { fontSize: '12px', color: '#94a3b8', margin: '0' }
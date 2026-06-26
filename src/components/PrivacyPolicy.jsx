import React from "react";
import { Link } from "react-router-dom";

const C = {
  pageBg: "#fbeae2",
  cardBg: "#ffffff",
  text1: "#181818",
  text2: "#3d3d3d",
  text3: "#666666",
  border: "#e8e2db",
  accent: "#f97316",
};

const Section = ({ title, children }) => (
  <section style={{ marginBottom: 24 }}>
    <h2
      style={{
        fontSize: 18,
        fontWeight: 800,
        color: C.text1,
        marginBottom: 8,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {title}
    </h2>
    <p
      style={{
        color: C.text2,
        fontSize: 14,
        lineHeight: 1.8,
        whiteSpace: "pre-wrap",
      }}
    >
      {children}
    </p>
  </section>
);

export default function PrivacyPolicy() {
  const effectiveDate = "April 28, 2026";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.pageBg,
        padding: "32px 20px 60px",
        fontFamily: "'DM Sans', 'Inter', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700;9..40,800&display=swap');
      `}</style>

      <div
        style={{
          maxWidth: 920,
          margin: "0 auto",
          background: C.cardBg,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          padding: "28px 24px",
        }}
      >
        <div style={{ marginBottom: 20 }}>
          <h1
            style={{
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 900,
              letterSpacing: -1,
              color: C.text1,
              marginBottom: 8,
            }}
          >
            Privacy Policy
          </h1>
          <p style={{ color: C.text3, fontSize: 13 }}>
            Effective date: {effectiveDate}
          </p>
        </div>

        <Section title="1. Information We Collect">
          We collect account information you provide (such as username, email, password hash, and optional phone), usage data needed to operate the platform, and billing-related records needed for subscription management.
        </Section>

        <Section title="2. How We Use Data">
          We use your data to provide authentication, run labs, enforce quotas, process subscriptions, prevent abuse, and improve platform reliability and security.
        </Section>

        <Section title="3. Billing and Payment Data">
          Payments are currently handled via manual Payoneer verification. We do not store your full payment card details. We store subscription metadata (for example plan and billing status) required for service access and quota enforcement.

          Paid plans include a 14-day refund window from the original payment date under our Refund Policy.
        </Section>

        <Section title="4. Security and Retention">
          We use reasonable technical controls to protect stored data. Data retention periods depend on operational, legal, and security requirements. Some records (for example audit or billing records) may be retained for compliance and fraud prevention.
        </Section>

        <Section title="5. Sharing">
          We do not sell personal data. Data may be shared with service providers strictly to operate the platform (for example hosting, email, and payment processing).
        </Section>

        <Section title="6. Your Choices">
          You can request account updates or deletion subject to legal or security retention obligations. You may cancel paid subscriptions through support channels.
        </Section>

        <Section title="7. Policy Updates">
          We may update this policy as the product evolves. Material updates may be reflected by an updated effective date and policy versioning in the product.
        </Section>

        <div
          style={{
            marginTop: 28,
            paddingTop: 16,
            borderTop: `1px solid ${C.border}`,
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <Link
            to="/terms"
            style={{
              textDecoration: "none",
              color: "#fff",
              background: C.accent,
              borderRadius: 999,
              padding: "10px 16px",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            View Terms
          </Link>
          <Link
            to="/login"
            style={{
              textDecoration: "none",
              color: C.text2,
              border: `1px solid ${C.border}`,
              borderRadius: 999,
              padding: "10px 16px",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            Back to Login
          </Link>
          <Link
            to="/refund-policy"
            style={{
              textDecoration: "none",
              color: C.text2,
              border: `1px solid ${C.border}`,
              borderRadius: 999,
              padding: "10px 16px",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            Refund Policy
          </Link>
        </div>
      </div>
    </div>
  );
}

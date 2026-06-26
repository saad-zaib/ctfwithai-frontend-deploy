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

export default function RefundPolicy() {
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
            Refund Policy
          </h1>
          <p style={{ color: C.text3, fontSize: 13 }}>
            Effective date: {effectiveDate}
          </p>
        </div>

        <Section title="1. 14-Day Refund Window">
          All paid plans are eligible for a refund request within 14 calendar days from the original payment date.
        </Section>

        <Section title="2. Eligibility">
          Refund requests submitted after 14 days from payment are not eligible under this policy.
        </Section>

        <Section title="3. Subscription Cancellation">
          Cancellation stops future recurring charges. Cancellation does not automatically issue a refund; refunds must be requested within the 14-day window.
        </Section>

        <Section title="4. Processing">
          Approved refunds are processed back to the original payment method used for your Payoneer-verified payment and may take additional banking time to appear.
        </Section>

        <Section title="5. Contact">
          To request a refund, contact support with your account email and payment details within 14 days of purchase.
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
            to="/pricing"
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
            Back to Pricing
          </Link>
          <Link
            to="/terms"
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
            View Terms
          </Link>
        </div>
      </div>
    </div>
  );
}

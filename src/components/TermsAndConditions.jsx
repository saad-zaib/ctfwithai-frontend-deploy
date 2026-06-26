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

export default function TermsAndConditions() {
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
            Terms and Conditions
          </h1>
          <p style={{ color: C.text3, fontSize: 13 }}>
            Effective date: {effectiveDate}
          </p>
        </div>

        <Section title="1. Platform Use">
          ctfWithAi is a cybersecurity training platform for authorized learning and simulation use only. You agree not to use generated labs, prompts, or outputs for unauthorized access, disruption, or illegal activity.
        </Section>

        <Section title="2. Accounts and Security">
          You are responsible for your account credentials and all activity under your account. You must provide accurate registration data and keep your password secure.
        </Section>

        <Section title="3. Billing and Subscriptions">
          Paid plans are billed monthly through manual Payoneer verification. By purchasing, you authorize recurring billing until cancellation. Plan limits (including monthly token limits) apply as published in the pricing page and product experience.

          Enterprise pricing is custom ("Call us") and managed under a separate commercial agreement.
        </Section>

        <Section title="3.1 Refunds">
          Paid plan purchases are covered by a 14-day refund window from the original payment date, subject to our Refund Policy.
        </Section>

        <Section title="4. Token and Resource Limits">
          Usage limits are enforced at the platform level, including AI token budgets, machine-generation quotas, and cooldown controls. Reaching limits may restrict generation or chat actions until renewal or upgrade.
        </Section>

        <Section title="5. Acceptable Use">
          You must not attempt to bypass quotas, abuse infrastructure, interfere with other users, or use the platform for real-world unauthorized attacks. We may suspend or terminate accounts for violations.
        </Section>

        <Section title="6. Availability and Changes">
          We may update features, limits, pricing, and terms over time. We do not guarantee uninterrupted availability. Material changes may be communicated in-product or by policy version updates.
        </Section>

        <Section title="7. Limitation of Liability">
          The platform is provided "as is" for training purposes. To the maximum extent permitted by law, ctfWithAi is not liable for indirect, incidental, or consequential damages resulting from use of the platform.
        </Section>

        <Section title="8. Contact">
          For legal, billing, or account questions, contact us through the channels listed on the site.
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
            to="/register"
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
            Back to Register
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

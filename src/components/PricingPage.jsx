import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_URL || "";

const C = {
  pageBg: "#fbeae2",
  cardBg: "#ffffff",
  text1: "#181818",
  text2: "#3d3d3d",
  text3: "#666666",
  border: "#e8e2db",
  accent: "#f97316",
  accentBg: "rgba(249,115,22,0.08)",
};

const fallbackPlans = [
  { plan_code: "free", display_name: "Free Tier", monthly_token_limit: 10000, price_label: "$0/month" },
  { plan_code: "pro", display_name: "Pro", monthly_token_limit: 30000, price_label: "$19/month" },
  { plan_code: "pro_plus", display_name: "Pro Plus", monthly_token_limit: 300000, price_label: "$79/month" },
  { plan_code: "enterprise", display_name: "Enterprise", monthly_token_limit: 0, price_label: "Contact us" },
];

export default function PricingPage() {
  const location = useLocation();
  const [plans, setPlans] = useState(fallbackPlans);
  const [supportEmail, setSupportEmail] = useState("support@ctfwithai.com");
  const [billingEmail, setBillingEmail] = useState("billing@ctfwithai.com");
  const [manualMode, setManualMode] = useState(false);
  const [currentPlan, setCurrentPlan] = useState("free");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState("");
  const [error, setError] = useState("");
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactSubject, setContactSubject] = useState("");
  const [contactDescription, setContactDescription] = useState("");
  const [sendingContact, setSendingContact] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [activePaymentRequest, setActivePaymentRequest] = useState(null);
  const [paymentRequestMessage, setPaymentRequestMessage] = useState("");
  const [proofTransactionId, setProofTransactionId] = useState("");
  const [proofAmount, setProofAmount] = useState("");
  const [proofCurrency, setProofCurrency] = useState("USD");
  const [proofNotes, setProofNotes] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [submittingProof, setSubmittingProof] = useState(false);
  const [cancellingRequest, setCancellingRequest] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token") || "";
        setIsLoggedIn(!!token);

        const res = await fetch(`${API_BASE}/api/billing/plans`);
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data?.plans) && data.plans.length) setPlans(data.plans);
        if (data?.contact?.support_email) setSupportEmail(data.contact.support_email);
        if (data?.contact?.billing_email) setBillingEmail(data.contact.billing_email);
        setManualMode(!!data?.manual_mode);

        if (token) {
          const meRes = await fetch(`${API_BASE}/api/billing/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (meRes.ok) {
            const meData = await meRes.json();
            const plan =
              meData?.quota?.plan_code ||
              meData?.subscription?.plan_code ||
              "free";
            setCurrentPlan(String(plan).toLowerCase());
          }

          const reqRes = await fetch(`${API_BASE}/api/billing/payment-requests/me?limit=25`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (reqRes.ok) {
            const reqData = await reqRes.json();
            const items = Array.isArray(reqData?.items) ? reqData.items : [];
            setPaymentRequests(items);
            setActivePaymentRequest(reqData?.active_request || items[0] || null);
          }

          const params = new URLSearchParams(location.search || "");
          const requestId = (params.get("request_id") || "").trim();
          if (requestId) {
            const detailRes = await fetch(`${API_BASE}/api/billing/payment-requests/${encodeURIComponent(requestId)}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (detailRes.ok) {
              const detail = await detailRes.json();
              if (detail?.payment_request) {
                setActivePaymentRequest(detail.payment_request);
              }
            }
          }
        }
      } catch (_) {}
    };
    load();
  }, [location.search]);

  const planRank = useMemo(
    () => ({ free: 0, pro: 1, pro_plus: 2, enterprise: 3 }),
    [],
  );

  const ordered = useMemo(() => {
    const order = { free: 0, pro: 1, pro_plus: 2, enterprise: 3 };
    return [...plans].sort((a, b) => (order[a.plan_code] ?? 99) - (order[b.plan_code] ?? 99));
  }, [plans]);

  const reloadPaymentRequests = async () => {
    const token = localStorage.getItem("token") || "";
    if (!token) return;
    const reqRes = await fetch(`${API_BASE}/api/billing/payment-requests/me?limit=25`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!reqRes.ok) return;
    const reqData = await reqRes.json();
    const items = Array.isArray(reqData?.items) ? reqData.items : [];
    setPaymentRequests(items);
    setActivePaymentRequest(reqData?.active_request || items[0] || null);
  };

  const createPaymentRequest = async (planCode) => {
    const token = localStorage.getItem("token") || "";
    if (!token) {
      window.location.href = "/login";
      return;
    }
    setLoadingPlan(planCode);
    setError("");
    setPaymentRequestMessage("");
    try {
      const res = await fetch(`${API_BASE}/api/billing/payment-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan_code: planCode }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);
      if (data?.payment_request) {
        setActivePaymentRequest(data.payment_request);
      }
      await reloadPaymentRequests();
      setPaymentRequestMessage(
        data?.existing
          ? "An existing payment receipt is active. Use its reference code for payment."
          : "Payment receipt generated. Complete payment and submit proof below.",
      );
    } catch (e) {
      setError(e.message || "Failed to create payment request.");
    } finally {
      setLoadingPlan("");
    }
  };

  const submitProof = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token") || "";
    const requestId = activePaymentRequest?.request_id;
    if (!token || !requestId) return;
    const txn = (proofTransactionId || "").trim();
    if (!txn && !proofFile) {
      setPaymentRequestMessage("Provide transaction ID or upload receipt file.");
      return;
    }
    setSubmittingProof(true);
    setPaymentRequestMessage("");
    try {
      let res;
      if (proofFile) {
        const form = new FormData();
        form.append("file", proofFile);
        if (txn) form.append("transaction_id", txn);
        if ((proofNotes || "").trim()) form.append("notes", (proofNotes || "").trim());
        res = await fetch(`${API_BASE}/api/billing/payment-requests/${encodeURIComponent(requestId)}/proof-upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: form,
        });
      } else {
        res = await fetch(`${API_BASE}/api/billing/payment-requests/${encodeURIComponent(requestId)}/proof`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            transaction_id: txn || null,
            amount: proofAmount ? Number(proofAmount) : null,
            currency: (proofCurrency || "USD").trim().toUpperCase(),
            notes: (proofNotes || "").trim() || null,
          }),
        });
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);
      setProofTransactionId("");
      setProofAmount("");
      setProofNotes("");
      setProofFile(null);
      setPaymentRequestMessage("Payment proof submitted. Admin review is pending.");
      await reloadPaymentRequests();
    } catch (err) {
      setPaymentRequestMessage(err.message || "Failed to submit proof.");
    } finally {
      setSubmittingProof(false);
    }
  };

  const cancelActiveRequest = async () => {
    const token = localStorage.getItem("token") || "";
    const requestId = activePaymentRequest?.request_id;
    if (!token || !requestId) return;
    const ok = window.confirm("Cancel this payment request?");
    if (!ok) return;
    setCancellingRequest(true);
    setPaymentRequestMessage("");
    try {
      const res = await fetch(`${API_BASE}/api/billing/payment-requests/${encodeURIComponent(requestId)}/cancel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);
      setPaymentRequestMessage("Payment request canceled.");
      await reloadPaymentRequests();
    } catch (err) {
      setPaymentRequestMessage(err.message || "Failed to cancel payment request.");
    } finally {
      setCancellingRequest(false);
    }
  };

  const startCheckout = async (planCode) => {
    if (planCode === "free") {
      window.location.href = isLoggedIn ? "/Dashboard" : "/Register";
      return;
    }
    if (planCode === "enterprise") {
      setContactMessage("");
      setShowContactModal(true);
      return;
    }

    if (manualMode) {
      await createPaymentRequest(planCode);
      return;
    }

    const token = localStorage.getItem("token") || "";
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const currentRank = planRank[currentPlan] ?? 0;
    const targetRank = planRank[planCode] ?? 0;
    if (targetRank <= currentRank) {
      setError(
        targetRank === currentRank
          ? `You are already on the ${planCode.replace("_", " ")} plan.`
          : "Downgrades are not supported from this page. Contact billing support.",
      );
      return;
    }

    setLoadingPlan(planCode);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/billing/checkout-link`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan_code: planCode }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);
      if (!data.checkout_url) throw new Error("Checkout URL was not returned.");
      window.location.href = data.checkout_url;
    } catch (e) {
      setError(e.message || "Failed to start checkout.");
    } finally {
      setLoadingPlan("");
    }
  };

  const sendContactRequest = async (e) => {
    e.preventDefault();
    setContactMessage("");
    const subject = contactSubject.trim();
    const description = contactDescription.trim();
    if (subject.length < 3) {
      setContactMessage("Subject must be at least 3 characters.");
      return;
    }
    if (description.length < 10) {
      setContactMessage("Description must be at least 10 characters.");
      return;
    }

    setSendingContact(true);
    try {
      const token = localStorage.getItem("token") || "";
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/api/billing/contact`, {
        method: "POST",
        headers,
        body: JSON.stringify({ subject, description }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);
      setContactMessage(`Your request has been sent. We will contact you at ${billingEmail}.`);
      setContactSubject("");
      setContactDescription("");
    } catch (err) {
      setContactMessage(err.message || "Failed to send request.");
    } finally {
      setSendingContact(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.pageBg, padding: "28px 20px 60px" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700;9..40,800&display=swap');`}</style>
      <div style={{ maxWidth: 1140, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h1 style={{ margin: 0, color: C.text1, fontSize: "clamp(30px, 5vw, 52px)", fontWeight: 900, letterSpacing: -1 }}>
            Pricing
          </h1>
          <p style={{ margin: "10px 0 0", color: C.text3, fontSize: 14 }}>
            14-day refund window on paid plans.
          </p>
          <p style={{ margin: "8px 0 0", color: C.text3, fontSize: 13 }}>
            See <Link to="/refund-policy" style={{ color: C.accent, fontWeight: 700 }}>Refund Policy</Link> for details. Also review <Link to="/terms" style={{ color: C.accent, fontWeight: 700 }}>Terms</Link> and <Link to="/privacy-policy" style={{ color: C.accent, fontWeight: 700 }}>Privacy Policy</Link>.
          </p>
          <p style={{ margin: "8px 0 0", color: C.text3, fontSize: 13 }}>
            Support: {supportEmail}
          </p>
          {manualMode && (
            <p style={{ margin: "6px 0 0", color: C.text3, fontSize: 13 }}>
              Billing is currently verified manually after payment.
            </p>
          )}
          {isLoggedIn && (
            <p style={{ margin: "6px 0 0", color: C.text3, fontSize: 13 }}>
              Current plan: <strong style={{ color: C.text2 }}>{currentPlan.replace("_", " ").toUpperCase()}</strong>
            </p>
          )}
        </div>

        {error && (
          <div style={{ background: "#fff", border: "1px solid rgba(220,38,38,0.25)", color: "#dc2626", borderRadius: 10, padding: "10px 12px", marginBottom: 14, fontSize: 13 }}>
            {error}
          </div>
        )}

        {isLoggedIn && !!activePaymentRequest && (
          <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 14, padding: 14, marginBottom: 14 }}>
            <h3 style={{ margin: 0, color: C.text1, fontSize: 18, fontWeight: 800 }}>
              Payoneer Payment Receipt
            </h3>
            <p style={{ margin: "8px 0 0", color: C.text3, fontSize: 13 }}>
              Reference: <strong style={{ color: C.text2 }}>{activePaymentRequest.reference_code}</strong> | Plan:{" "}
              <strong style={{ color: C.text2 }}>{String(activePaymentRequest.target_plan_code || "").toUpperCase()}</strong> | Amount:{" "}
              <strong style={{ color: C.text2 }}>${Number(activePaymentRequest.amount_usd || 0)}</strong> {activePaymentRequest.currency || "USD"}
            </p>
            <p style={{ margin: "6px 0 0", color: C.text3, fontSize: 13 }}>
              Status: <strong style={{ color: C.text2 }}>{activePaymentRequest.status || "awaiting_payment"}</strong>
              {activePaymentRequest.expires_at ? ` | Expires: ${new Date(activePaymentRequest.expires_at).toLocaleString()}` : ""}
            </p>
            <p style={{ margin: "6px 0 0", color: C.text3, fontSize: 13 }}>
              Pay to: {(activePaymentRequest.payee_details || {}).payee_name || "ctfWithAi Billing"}{" "}
              ({(activePaymentRequest.payee_details || {}).payee_email || billingEmail})
              {(activePaymentRequest.payee_details || {}).payee_account_id ? ` | Account ID: ${(activePaymentRequest.payee_details || {}).payee_account_id}` : ""}
            </p>
            {!!(activePaymentRequest.payee_details || {}).payee_account_holder && (
              <p style={{ margin: "6px 0 0", color: C.text3, fontSize: 13 }}>
                Account holder: {(activePaymentRequest.payee_details || {}).payee_account_holder}
                {!!(activePaymentRequest.payee_details || {}).payee_country ? ` | Country: ${(activePaymentRequest.payee_details || {}).payee_country}` : ""}
                {!!(activePaymentRequest.payee_details || {}).payee_network ? ` | Network: ${(activePaymentRequest.payee_details || {}).payee_network}` : ""}
              </p>
            )}
            <p style={{ margin: "6px 0 10px", color: C.text3, fontSize: 13 }}>
              {(activePaymentRequest.payee_details || {}).payment_note || "Include the reference code in payment note."}
            </p>
            {!!(activePaymentRequest.payee_details || {}).warning && (
              <p style={{ margin: "0 0 10px", color: "#b91c1c", fontSize: 12, fontWeight: 700 }}>
                {(activePaymentRequest.payee_details || {}).warning}
              </p>
            )}

            <form onSubmit={submitProof} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 8 }}>
              <input
                type="text"
                value={proofTransactionId}
                onChange={(e) => setProofTransactionId(e.target.value)}
                placeholder="Receipt / Transaction ID (optional if file uploaded)"
                style={{ padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.border}`, outline: "none", fontSize: 13 }}
              />
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                style={{ padding: "8px 8px", borderRadius: 10, border: `1px solid ${C.border}`, outline: "none", fontSize: 13, background: "#fff" }}
              />
              <input
                type="number"
                step="0.01"
                min="0"
                value={proofAmount}
                onChange={(e) => setProofAmount(e.target.value)}
                placeholder="Paid amount (optional)"
                style={{ padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.border}`, outline: "none", fontSize: 13 }}
              />
              <input
                type="text"
                value={proofCurrency}
                onChange={(e) => setProofCurrency(e.target.value)}
                placeholder="Currency"
                maxLength={8}
                style={{ padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.border}`, outline: "none", fontSize: 13 }}
              />
              <input
                type="text"
                value={proofNotes}
                onChange={(e) => setProofNotes(e.target.value)}
                placeholder="Notes (optional)"
                maxLength={4000}
                style={{ padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.border}`, outline: "none", fontSize: 13 }}
              />
              <button
                type="submit"
                disabled={submittingProof}
                style={{
                  border: "none",
                  borderRadius: 999,
                  padding: "10px 12px",
                  fontSize: 13,
                  fontWeight: 800,
                  background: C.accent,
                  color: "#fff",
                  cursor: submittingProof ? "not-allowed" : "pointer",
                  opacity: submittingProof ? 0.7 : 1,
                }}
              >
                {submittingProof ? "Submitting..." : "Submit Payment Proof"}
              </button>
              {["awaiting_payment", "proof_submitted", "under_review"].includes(String(activePaymentRequest.status || "")) && (
                <button
                  type="button"
                  onClick={cancelActiveRequest}
                  disabled={cancellingRequest}
                  style={{
                    border: `1px solid ${C.border}`,
                    borderRadius: 999,
                    padding: "10px 12px",
                    fontSize: 13,
                    fontWeight: 800,
                    background: "#fff",
                    color: "#b91c1c",
                    cursor: cancellingRequest ? "not-allowed" : "pointer",
                    opacity: cancellingRequest ? 0.7 : 1,
                  }}
                >
                  {cancellingRequest ? "Canceling..." : "Cancel Request"}
                </button>
              )}
            </form>

            {!!paymentRequestMessage && (
              <div style={{ marginTop: 8, fontSize: 13, color: paymentRequestMessage.toLowerCase().includes("failed") ? "#b91c1c" : "#166534" }}>
                {paymentRequestMessage}
              </div>
            )}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 16 }}>
          {ordered.map((p) => {
            const isPopular = p.plan_code === "pro_plus";
            const limitText =
              p.plan_code === "free"
                ? "Limited monthly usage"
                : p.plan_code === "pro"
                  ? "Expanded monthly usage"
                  : p.plan_code === "pro_plus"
                    ? "High monthly usage"
                    : "Custom usage and controls";
            const currentRank = planRank[currentPlan] ?? 0;
            const targetRank = planRank[p.plan_code] ?? 0;
            const isCurrent = isLoggedIn && p.plan_code === currentPlan;
            const isLowerTier = isLoggedIn && targetRank < currentRank;
            const cta = p.plan_code === "enterprise"
              ? "Contact Us"
              : p.plan_code === "free"
                ? (isLoggedIn ? (isCurrent ? "Current Plan" : "Included") : "Start Free")
                : isCurrent
                  ? "Current Plan"
                  : isLowerTier
                    ? "Downgrade (Support)"
                    : isLoggedIn
                      ? `Upgrade to ${p.display_name}`
                      : `Choose ${p.display_name}`;
            const busy = loadingPlan === p.plan_code;
            const disabled = busy || isCurrent || isLowerTier;

            return (
              <div
                key={p.plan_code}
                style={{
                  background: isPopular ? "linear-gradient(165deg, rgba(249,115,22,0.14), rgba(255,255,255,0.76))" : C.cardBg,
                  border: `1px solid ${isPopular ? C.accent : C.border}`,
                  borderRadius: 18,
                  padding: "22px 18px",
                  position: "relative",
                }}
              >
                {isPopular && (
                  <span style={{ position: "absolute", top: 12, right: 12, background: C.accent, color: "#fff", borderRadius: 999, padding: "4px 8px", fontSize: 10, fontWeight: 800 }}>
                    MOST POPULAR
                  </span>
                )}
                <h3 style={{ margin: 0, color: C.text1, fontSize: 22, fontWeight: 800 }}>{p.display_name}</h3>
                <div style={{ marginTop: 8, color: isPopular ? "#dc5e08" : C.text1, fontSize: 34, fontWeight: 900, letterSpacing: -1 }}>{p.price_label}</div>
                <div style={{ marginTop: 8, color: C.text2, fontSize: 13, fontWeight: 700 }}>{limitText}</div>
                <button
                  onClick={() => startCheckout(p.plan_code)}
                  disabled={disabled}
                  style={{
                    marginTop: 16,
                    width: "100%",
                    border: "none",
                    borderRadius: 999,
                    padding: "10px 12px",
                    fontSize: 13,
                    fontWeight: 800,
                    background: isPopular ? C.accent : C.accentBg,
                    color: isPopular ? "#fff" : C.text2,
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.7 : 1,
                  }}
                >
                  {busy ? "Please wait..." : cta}
                </button>
              </div>
            );
          })}
        </div>

        {isLoggedIn && paymentRequests.length > 0 && (
          <div style={{ marginTop: 14, background: "#fff", border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}`, fontSize: 13, fontWeight: 800, color: C.text2 }}>
              Payment Requests
            </div>
            {paymentRequests.map((r) => (
              <button
                key={r.request_id}
                type="button"
                onClick={() => setActivePaymentRequest(r)}
                style={{
                  width: "100%",
                  border: "none",
                  borderBottom: `1px solid ${C.border}`,
                  background: activePaymentRequest?.request_id === r.request_id ? "rgba(249,115,22,0.08)" : "#fff",
                  padding: "10px 12px",
                  textAlign: "left",
                  fontSize: 12,
                  color: C.text2,
                  cursor: "pointer",
                }}
              >
                {r.reference_code} | {String(r.target_plan_code || "").toUpperCase()} | ${Number(r.amount_usd || 0)} {r.currency || "USD"} | {r.status}
              </button>
            ))}
          </div>
        )}

        {showContactModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: 16,
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: 560,
                background: "#fff",
                borderRadius: 14,
                border: `1px solid ${C.border}`,
                padding: 18,
              }}
            >
              <h3 style={{ margin: 0, color: C.text1, fontSize: 22, fontWeight: 800 }}>Contact Us</h3>
              <p style={{ margin: "8px 0 14px", color: C.text3, fontSize: 13 }}>
                Send your enterprise request. It will be emailed to {billingEmail}.
              </p>

              <form onSubmit={sendContactRequest} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <input
                  type="text"
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                  placeholder="Subject"
                  maxLength={200}
                  required
                  style={{
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: `1px solid ${C.border}`,
                    outline: "none",
                    fontSize: 14,
                  }}
                />
                <textarea
                  value={contactDescription}
                  onChange={(e) => setContactDescription(e.target.value)}
                  placeholder="Description"
                  maxLength={4000}
                  rows={8}
                  required
                  style={{
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: `1px solid ${C.border}`,
                    outline: "none",
                    fontSize: 14,
                    resize: "vertical",
                  }}
                />

                {!!contactMessage && (
                  <div style={{ fontSize: 13, color: contactMessage.startsWith("Your request") ? "#166534" : "#b91c1c" }}>
                    {contactMessage}
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setShowContactModal(false)}
                    style={{
                      border: `1px solid ${C.border}`,
                      borderRadius: 999,
                      padding: "9px 12px",
                      fontSize: 13,
                      fontWeight: 700,
                      background: "#fff",
                      color: C.text2,
                      cursor: "pointer",
                    }}
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={sendingContact}
                    style={{
                      border: "none",
                      borderRadius: 999,
                      padding: "9px 14px",
                      fontSize: 13,
                      fontWeight: 800,
                      background: C.accent,
                      color: "#fff",
                      cursor: sendingContact ? "not-allowed" : "pointer",
                      opacity: sendingContact ? 0.7 : 1,
                    }}
                  >
                    {sendingContact ? "Sending..." : "Send"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useMemo, useState } from "react";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

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

function fmtNum(v) {
  const n = Number(v || 0);
  return Number.isFinite(n) ? n.toLocaleString() : "0";
}

function pct(used, limit) {
  const u = Number(used || 0);
  const l = Number(limit || 0);
  if (!l || l <= 0) return "-";
  return `${Math.min(100, Math.round((u / l) * 100))}%`;
}

export default function BillingAdmin() {
  const [items, setItems] = useState([]);
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [rq, setRq] = useState("");
  const [requestStatus, setRequestStatus] = useState("proof_submitted");
  const [actingRequestId, setActingRequestId] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token") || "";
      const qp = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
      const res = await fetch(`${API_BASE}/api/billing/admin/users${qp}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (e) {
      setError(e.message || "Failed to load billing overview.");
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentRequests = async () => {
    setLoadingRequests(true);
    try {
      const token = localStorage.getItem("token") || "";
      const params = new URLSearchParams();
      if (requestStatus) params.set("status", requestStatus);
      if (rq.trim()) params.set("q", rq.trim());
      params.set("limit", "200");
      const res = await fetch(`${API_BASE}/api/billing/admin/payment-requests?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setPaymentRequests(Array.isArray(data.items) ? data.items : []);
    } catch (e) {
      setError(e.message || "Failed to load payment requests.");
    } finally {
      setLoadingRequests(false);
    }
  };

  const decidePaymentRequest = async (requestId, decision) => {
    const reason = window.prompt(
      decision === "approve"
        ? "Optional approval note"
        : "Reason for rejection (required)",
      "",
    );
    if (decision === "reject" && !String(reason || "").trim()) return;
    setActingRequestId(requestId);
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`${API_BASE}/api/billing/admin/payment-requests/${encodeURIComponent(requestId)}/decision`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          decision,
          reason: String(reason || "").trim() || null,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.detail || `HTTP ${res.status}`);
      await Promise.all([loadPaymentRequests(), load()]);
    } catch (e) {
      setError(e.message || "Failed to apply decision.");
    } finally {
      setActingRequestId("");
    }
  };

  const downloadProofFile = async (requestId) => {
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`${API_BASE}/api/billing/payment-requests/${encodeURIComponent(requestId)}/proof-file`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${requestId}-proof`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.message || "Failed to download proof file.");
    }
  };

  useEffect(() => {
    Promise.all([load(), loadPaymentRequests()]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    let blocked = 0;
    let pro = 0;
    let proPlus = 0;
    let free = 0;
    let enterprise = 0;
    for (const it of items) {
      const plan = it?.quota?.plan_code || "free";
      if (it?.quota?.blocked) blocked += 1;
      if (plan === "pro") pro += 1;
      else if (plan === "pro_plus") proPlus += 1;
      else if (plan === "enterprise") enterprise += 1;
      else free += 1;
    }
    return { blocked, pro, proPlus, free, enterprise };
  }, [items]);

  const exportCsv = () => {
    const headers = [
      "user_id",
      "username",
      "email",
      "full_name",
      "role",
      "plan_code",
      "subscription_status",
      "period_key",
      "monthly_token_limit",
      "used_tokens",
      "remaining_tokens",
      "blocked",
      "terms_accepted",
      "terms_version",
      "terms_accepted_at",
    ];

    const esc = (v) => {
      const s = String(v ?? "");
      if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };

    const rows = items.map((it) => {
      const q = it.quota || {};
      const s = it.subscription || {};
      const t = it.terms || {};
      return [
        it.user_id,
        it.username,
        it.email,
        it.full_name,
        it.role,
        q.plan_code || s.plan_code || "free",
        q.subscription_status || s.status || "",
        q.period_key || "",
        q.monthly_token_limit ?? "",
        q.used_tokens ?? "",
        q.remaining_tokens ?? "",
        q.blocked ? "true" : "false",
        t.accepted ? "true" : "false",
        t.version || "",
        t.accepted_at || "",
      ];
    });

    const csv = [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const d = new Date();
    const stamp = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
    a.href = url;
    a.download = `billing-overview-${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.pageBg, padding: "24px 20px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
        <div
          style={{
            background: C.cardBg,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: "18px 16px",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 900,
              color: C.text1,
              letterSpacing: -0.6,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Billing Overview
          </h1>
          <p style={{ margin: "8px 0 0", color: C.text3, fontSize: 13 }}>
            Per-user subscription, monthly token usage, and terms acceptance status.
          </p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
            {[
              `Free: ${stats.free}`,
              `Pro: ${stats.pro}`,
              `Pro Plus: ${stats.proPlus}`,
              `Enterprise: ${stats.enterprise}`,
              `Blocked: ${stats.blocked}`,
            ].map((s) => (
              <span
                key={s}
                style={{
                  background: C.accentBg,
                  border: `1px solid ${C.border}`,
                  borderRadius: 999,
                  padding: "6px 10px",
                  fontSize: 12,
                  color: C.text2,
                  fontWeight: 700,
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        <div
          style={{
            background: C.cardBg,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: "12px",
          }}
        >
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search user/email"
              style={{
                flex: 1,
                minWidth: 220,
                padding: "10px 12px",
                borderRadius: 10,
                border: `1px solid ${C.border}`,
                outline: "none",
                fontSize: 13,
              }}
            />
            <button
              onClick={() => {
                load();
                loadPaymentRequests();
              }}
              style={{
                border: "none",
                borderRadius: 10,
                padding: "10px 14px",
                cursor: "pointer",
                background: C.accent,
                color: "#fff",
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              Refresh
            </button>
            <button
              onClick={exportCsv}
              disabled={items.length === 0}
              style={{
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                padding: "10px 14px",
                cursor: items.length === 0 ? "not-allowed" : "pointer",
                background: items.length === 0 ? "#f3f4f6" : "#fff",
                color: C.text2,
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              Export CSV
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{
              background: "#fff",
              border: "1px solid rgba(220,38,38,0.25)",
              color: "#dc2626",
              borderRadius: 10,
              padding: "10px 12px",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            background: C.cardBg,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            overflow: "auto",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 980 }}>
            <thead>
              <tr style={{ background: "#fff8f3" }}>
                {[
                  "User",
                  "Role",
                  "Plan",
                  "Tokens Used",
                  "Limit",
                  "Remaining",
                  "Usage",
                  "Blocked",
                  "Terms",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "11px 10px",
                      borderBottom: `1px solid ${C.border}`,
                      fontSize: 12,
                      color: C.text2,
                      fontWeight: 800,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ padding: 14, fontSize: 13, color: C.text3 }}>
                    Loading billing overview...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: 14, fontSize: 13, color: C.text3 }}>
                    No users found.
                  </td>
                </tr>
              ) : (
                items.map((it) => {
                  const quota = it.quota || {};
                  return (
                    <tr key={it.user_id}>
                      <td style={{ padding: "10px", borderBottom: `1px solid ${C.border}` }}>
                        <div style={{ fontSize: 13, color: C.text1, fontWeight: 700 }}>{it.username || "-"}</div>
                        <div style={{ fontSize: 12, color: C.text3 }}>{it.email || "-"}</div>
                      </td>
                      <td style={{ padding: "10px", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>{it.role || "-"}</td>
                      <td style={{ padding: "10px", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>{quota.plan_code || "free"}</td>
                      <td style={{ padding: "10px", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>{fmtNum(quota.used_tokens)}</td>
                      <td style={{ padding: "10px", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>{fmtNum(quota.monthly_token_limit)}</td>
                      <td style={{ padding: "10px", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>{fmtNum(quota.remaining_tokens)}</td>
                      <td style={{ padding: "10px", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>{pct(quota.used_tokens, quota.monthly_token_limit)}</td>
                      <td style={{ padding: "10px", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>
                        <span
                          style={{
                            borderRadius: 999,
                            padding: "4px 8px",
                            fontWeight: 700,
                            background: quota.blocked ? "rgba(220,38,38,0.12)" : "rgba(22,163,74,0.12)",
                            color: quota.blocked ? "#b91c1c" : "#166534",
                          }}
                        >
                          {quota.blocked ? "Yes" : "No"}
                        </span>
                      </td>
                      <td style={{ padding: "10px", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>
                        {it.terms?.accepted ? `Accepted (${it.terms?.version || "v1"})` : "Not accepted"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div
          style={{
            background: C.cardBg,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: 12,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.text1 }}>Payment Verification Queue</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <select
                value={requestStatus}
                onChange={(e) => setRequestStatus(e.target.value)}
                style={{
                  padding: "9px 10px",
                  borderRadius: 10,
                  border: `1px solid ${C.border}`,
                  fontSize: 13,
                  color: C.text2,
                  background: "#fff",
                }}
              >
                <option value="proof_submitted">proof_submitted</option>
                <option value="awaiting_payment">awaiting_payment</option>
                <option value="rejected">rejected</option>
                <option value="applied">applied</option>
              </select>
              <input
                type="text"
                value={rq}
                onChange={(e) => setRq(e.target.value)}
                placeholder="Search request/ref/txn/user"
                style={{
                  minWidth: 220,
                  padding: "9px 10px",
                  borderRadius: 10,
                  border: `1px solid ${C.border}`,
                  fontSize: 13,
                }}
              />
              <button
                onClick={loadPaymentRequests}
                style={{
                  border: "none",
                  borderRadius: 10,
                  padding: "9px 12px",
                  cursor: "pointer",
                  background: C.accent,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                Load Requests
              </button>
            </div>
          </div>

          <div style={{ overflow: "auto", border: `1px solid ${C.border}`, borderRadius: 10 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1050 }}>
              <thead>
                <tr style={{ background: "#fff8f3" }}>
                  {["Request", "User", "Plan", "Amount", "Status", "Receipt Proof", "File", "Submitted", "Actions"].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "10px",
                        borderBottom: `1px solid ${C.border}`,
                        fontSize: 12,
                        color: C.text2,
                        fontWeight: 800,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loadingRequests ? (
                  <tr>
                    <td colSpan={9} style={{ padding: 12, fontSize: 13, color: C.text3 }}>Loading payment requests...</td>
                  </tr>
                ) : paymentRequests.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: 12, fontSize: 13, color: C.text3 }}>No payment requests found.</td>
                  </tr>
                ) : (
                  paymentRequests.map((r) => (
                    <tr key={r.request_id}>
                      <td style={{ padding: "10px", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>
                        <div style={{ fontWeight: 700, color: C.text1 }}>{r.request_id}</div>
                        <div style={{ color: C.text3 }}>{r.reference_code || "-"}</div>
                      </td>
                      <td style={{ padding: "10px", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>{r.user_id || "-"}</td>
                      <td style={{ padding: "10px", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>{r.target_plan_code || "-"}</td>
                      <td style={{ padding: "10px", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>${fmtNum(r.amount_usd)} {r.currency || "USD"}</td>
                      <td style={{ padding: "10px", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>{r.status || "-"}</td>
                      <td style={{ padding: "10px", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>
                        <div>ID: {r.proof_transaction_id || "-"}</div>
                        <div style={{ color: C.text3 }}>Payer: {r.proof_payer_name || "-"}</div>
                      </td>
                      <td style={{ padding: "10px", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>
                        {r.proof_attachment_url ? (
                          <button
                            onClick={() => downloadProofFile(r.request_id)}
                            style={{
                              border: `1px solid ${C.border}`,
                              borderRadius: 8,
                              padding: "6px 9px",
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: "pointer",
                              background: "#fff",
                              color: C.text2,
                            }}
                          >
                            Download
                          </button>
                        ) : "-"}
                      </td>
                      <td style={{ padding: "10px", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>
                        {r.proof_submitted_at ? new Date(r.proof_submitted_at).toLocaleString() : "-"}
                      </td>
                      <td style={{ padding: "10px", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => decidePaymentRequest(r.request_id, "approve")}
                            disabled={actingRequestId === r.request_id}
                            style={{
                              border: "none",
                              borderRadius: 8,
                              padding: "7px 10px",
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: "pointer",
                              background: "rgba(22,163,74,0.14)",
                              color: "#166534",
                            }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => decidePaymentRequest(r.request_id, "reject")}
                            disabled={actingRequestId === r.request_id}
                            style={{
                              border: "none",
                              borderRadius: 8,
                              padding: "7px 10px",
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: "pointer",
                              background: "rgba(220,38,38,0.12)",
                              color: "#b91c1c",
                            }}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

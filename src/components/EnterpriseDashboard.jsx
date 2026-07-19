import React, { useState, useEffect } from 'react';
import { Building2, UserPlus, Mail, Lock, User, Eye, EyeOff, Loader, AlertCircle, CheckCircle, Shield, Target, Settings, Users, BarChart3, Clock } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || "";

// ─── Enterprise Admin Dashboard ──────────────────────────────────────────────
const EnterpriseDashboard = () => {
    const role = localStorage.getItem('role') || '';
    const username = localStorage.getItem('username') || 'Admin';
    const token = localStorage.getItem('token');

    const [orgCampaigns, setOrgCampaigns] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [settingsMap, setSettingsMap] = useState({});
    const [savingSettings, setSavingSettings] = useState({});
    const [settingsMsg, setSettingsMsg] = useState({});
    const [loadingData, setLoadingData] = useState(true);

    const authH = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

    useEffect(() => {
        if (role !== 'enterprise_admin') return;
        const load = async () => {
            try {
                // Fetch org campaigns
                const cRes = await fetch(`${API_BASE}/api/campaigns/org`, { headers: authH });
                if (cRes.ok) { const d = await cRes.json(); setOrgCampaigns(d.campaigns || d || []); }

                // Fetch staff accounts
                const sRes = await fetch(`${API_BASE}/api/auth/enterprise/staff`, { headers: authH });
                if (sRes.ok) { const d = await sRes.json(); setStaffList(d.staff || d || []); }
            } catch (_) {}
            setLoadingData(false);
        };
        load();
    }, [role]);

    const loadStaffSettings = async (staffId) => {
        if (settingsMap[staffId]) return; // already loaded
        try {
            const res = await fetch(`${API_BASE}/api/auth/enterprise/staff/${staffId}/settings`, { headers: authH });
            if (res.ok) {
                const d = await res.json();
                setSettingsMap(prev => ({ ...prev, [staffId]: d }));
            }
        } catch (_) {}
    };

    const saveSettings = async (staffId, newMax) => {
        setSavingSettings(prev => ({ ...prev, [staffId]: true }));
        try {
            const res = await fetch(`${API_BASE}/api/auth/enterprise/staff/${staffId}/settings`, {
                method: 'PUT', headers: authH,
                body: JSON.stringify({ max_students: parseInt(newMax) || 30 }),
            });
            const d = await res.json();
            if (res.ok) {
                setSettingsMap(prev => ({ ...prev, [staffId]: d }));
                setSettingsMsg(prev => ({ ...prev, [staffId]: { type: 'ok', text: 'Saved!' } }));
            } else {
                setSettingsMsg(prev => ({ ...prev, [staffId]: { type: 'err', text: d.detail || 'Failed' } }));
            }
        } catch (_) {
            setSettingsMsg(prev => ({ ...prev, [staffId]: { type: 'err', text: 'Network error' } }));
        }
        setSavingSettings(prev => ({ ...prev, [staffId]: false }));
        setTimeout(() => setSettingsMsg(prev => { const n = {...prev}; delete n[staffId]; return n; }), 3000);
    };

    // Guard: only enterprise_admin can see this
    if (role !== 'enterprise_admin') {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto">
                        <Shield className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#181818]">Access Denied</h2>
                    <p className="text-[#797979] text-sm max-w-md">
                        You don't have permission to access the Enterprise Admin Dashboard.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-6 py-8">
            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .fade-in { animation: fadeUp 0.4s ease both; }
                .fade-in-d { animation: fadeUp 0.4s ease 0.1s both; }
            `}</style>

            {/* Header */}
            <div className="flex items-center gap-4 mb-8 fade-in">
                <div className="w-14 h-14 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center">
                    <Building2 className="w-7 h-7 text-orange-500" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-[#181818]">Enterprise Admin Dashboard</h1>
                    <p className="text-[#797979] text-sm">
                        Welcome, <span className="text-orange-500 font-semibold">{username}</span> — manage your organization's accounts
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Create Staff Account Form */}
                <div className="lg:col-span-2 fade-in-d">
                    <CreateStaffForm />
                </div>

                {/* Info / Permissions Panel */}
                <div className="space-y-4 fade-in-d">
                    <div className="rounded-xl border border-[#e8e2db] bg-white p-5">
                        <h3 className="text-sm font-semibold text-[#181818] mb-3 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-orange-500" />
                            Admin Permissions
                        </h3>
                        <ul className="space-y-2 text-xs text-[#797979]">
                            <li className="flex items-start gap-2"><span className="text-orange-500 mt-0.5">✓</span>Create staff/teacher accounts</li>
                            <li className="flex items-start gap-2"><span className="text-orange-500 mt-0.5">✓</span>Staff inherit your organization</li>
                            <li className="flex items-start gap-2"><span className="text-orange-500 mt-0.5">✓</span>Adjust teacher CSV limits</li>
                            <li className="flex items-start gap-2"><span className="text-orange-500 mt-0.5">✓</span>Monitor org campaigns (read-only)</li>
                        </ul>
                    </div>
                    <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4">
                        <p className="text-xs text-[#797979] leading-relaxed">
                            <strong className="text-orange-500">Security note:</strong> Staff accounts are automatically
                            linked to your organization. They cannot reset their own passwords — only you can manage credentials.
                        </p>
                    </div>
                </div>
            </div>

            {/* Campaign Monitor */}
            <div className="mt-8 fade-in-d">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center">
                        <Target className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-[#181818]">Campaign Monitor</h2>
                        <p className="text-xs text-[#797979]">Read-only overview of all campaigns created by your staff</p>
                    </div>
                    <span className="ml-auto text-xs font-bold text-orange-400 bg-orange-500/10 border border-orange-500/25 px-3 py-1 rounded-full">
                        {orgCampaigns.length} campaigns
                    </span>
                </div>

                {loadingData ? (
                    <div className="text-center py-8">
                        <Loader className="w-5 h-5 text-orange-500 animate-spin mx-auto" />
                    </div>
                ) : orgCampaigns.length === 0 ? (
                    <div className="rounded-xl border border-[#e8e2db] bg-white py-10 text-center">
                        <BarChart3 className="w-8 h-8 text-[#c7bfb8] mx-auto mb-2" />
                        <p className="text-xs text-[#797979]">No campaigns created yet by your staff.</p>
                    </div>
                ) : (
                    <div className="rounded-xl border border-[#e8e2db] bg-white overflow-hidden">
                        <div className="grid grid-cols-5 gap-4 px-5 py-2.5 border-b border-[#e8e2db] text-xs font-semibold text-[#797979] uppercase tracking-wider bg-[#faf5f1]">
                            <span className="col-span-2">Campaign</span>
                            <span>Machines</span>
                            <span>Timer</span>
                            <span>Status</span>
                        </div>
                        {orgCampaigns.slice(0, 10).map((c, i) => (
                            <div key={c.campaign_id} className="grid grid-cols-5 gap-4 px-5 py-3 border-b border-[#eee7e1] last:border-0 items-center hover:bg-orange-50/60 transition-colors">
                                <div className="col-span-2 min-w-0">
                                    <p className="text-sm font-semibold text-[#181818] truncate">{c.campaign_name}</p>
                                    <p className="text-xs text-[#797979] truncate font-mono">{c.campaign_id?.slice(0, 12)}…</p>
                                </div>
                                <span className="text-sm text-[#3d3d3d] tabular-nums">{c.machine_count || 0}</span>
                                <span className="text-sm text-[#3d3d3d] flex items-center gap-1">
                                    <Clock className="w-3 h-3" />{c.time_limit_minutes || 30}m
                                </span>
                                <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full w-fit ${
                                    c.status === 'active' ? 'text-green-400 bg-green-500/10 border border-green-500/25'
                                    : 'text-[#797979] bg-[#f5efea] border border-[#e8e2db]'
                                }`}>{c.status || 'active'}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Staff Settings Manager */}
            <div className="mt-8 fade-in-d">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center">
                        <Settings className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-[#181818]">Staff Settings</h2>
                        <p className="text-xs text-[#797979]">Manage per-teacher CSV student limits</p>
                    </div>
                </div>

                {staffList.length === 0 ? (
                    <div className="rounded-xl border border-[#e8e2db] bg-white py-8 text-center">
                        <Users className="w-7 h-7 text-[#c7bfb8] mx-auto mb-2" />
                        <p className="text-xs text-[#797979]">No staff accounts yet. Create one above.</p>
                    </div>
                ) : (
                    <div className="rounded-xl border border-[#e8e2db] bg-white overflow-hidden">
                        {staffList.map((staff, i) => {
                            const settings = settingsMap[staff.user_id] || {};
                            const saving = savingSettings[staff.user_id];
                            const msg = settingsMsg[staff.user_id];

                            return (
                                <div key={staff.user_id} className="px-5 py-3.5 border-b border-[#eee7e1] last:border-0 flex items-center gap-4 flex-wrap">
                                    {/* Avatar */}
                                    <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-sm font-bold text-orange-500 flex-shrink-0">
                                        {(staff.username || staff.email || '?').slice(0, 1).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-[#181818] truncate">{staff.username}</p>
                                        <p className="text-xs text-[#797979] truncate">{staff.email}</p>
                                    </div>
                                    {/* CSV status badge */}
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                        settings.csv_uploaded ? 'text-green-400 bg-green-500/10 border border-green-500/25'
                                        : 'text-[#797979] bg-[#f5efea] border border-[#e8e2db]'
                                    }`}>
                                        {settings.csv_uploaded ? 'CSV Uploaded' : 'No CSV'}
                                    </span>
                                    {/* Max students input */}
                                    <div className="flex items-center gap-2">
                                        <label className="text-xs text-[#797979] whitespace-nowrap">Max Students:</label>
                                        <input
                                            type="number" min="1" max="500"
                                            defaultValue={settings.max_students || 30}
                                            onFocus={() => loadStaffSettings(staff.user_id)}
                                            onChange={(e) => setSettingsMap(prev => ({
                                                ...prev,
                                                [staff.user_id]: { ...prev[staff.user_id], max_students: parseInt(e.target.value) || 30 }
                                            }))}
                                            className="w-20 px-2 py-1 bg-[#fffaf7] border border-[#e8e2db] rounded-lg text-[#181818] text-xs focus:border-orange-500 outline-none"
                                        />
                                        <button
                                            onClick={() => saveSettings(staff.user_id, settings.max_students || 30)}
                                            disabled={saving}
                                            className="text-xs font-bold px-3 py-1 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-500 transition-colors disabled:opacity-50"
                                        >
                                            {saving ? <Loader className="w-3 h-3 animate-spin" /> : 'Save'}
                                        </button>
                                        {msg && (
                                            <span className={`text-xs font-semibold ${msg.type === 'ok' ? 'text-green-400' : 'text-red-400'}`}>
                                                {msg.text}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};


// ─── Create Staff Account Form ───────────────────────────────────────────────
const CreateStaffForm = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        // Client-side validation
        if (!firstName.trim() || !email.trim() || !password.trim()) {
            setError('Please fill in all required fields.');
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }

        try {
            setLoading(true);

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/auth/enterprise/create-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    first_name: firstName.trim(),
                    last_name: lastName.trim(),
                    email: email.trim(),
                    password,
                }),
            });

            if (!response.ok) {
                const body = await response.json().catch(() => ({}));
                throw new Error(body.detail || 'Failed to create account.');
            }

            const data = await response.json();
            setSuccess(`Staff account created for ${data.email} (username: ${data.username})`);

            // Reset form
            setFirstName('');
            setLastName('');
            setEmail('');
            setPassword('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-xl border border-[#e8e2db] bg-white overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#e8e2db] flex items-center gap-3 bg-[#fffaf7]">
                <div className="w-9 h-9 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-[#181818]">Create Staff Account</h2>
                    <p className="text-xs text-[#797979]">Add a new staff or teacher to your organization</p>
                </div>
            </div>

            <div className="px-6 py-5">
                {/* Success banner */}
                {success && (
                    <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-green-500/10 border border-green-500/25 mb-4">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <p className="text-green-700 text-xs">{success}</p>
                    </div>
                )}

                {/* Error banner */}
                {error && (
                    <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-red-500/10 border border-red-500/25 mb-4">
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <p className="text-red-700 text-xs">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Name row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-[#797979] mb-1.5 uppercase tracking-wider">
                                First Name *
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b9afa7] pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="John"
                                    value={firstName}
                                    onChange={e => { setFirstName(e.target.value); setError(null); }}
                                    className="w-full pl-10 pr-3 py-2.5 bg-[#fffaf7] border border-[#e8e2db] rounded-lg text-[#181818] text-sm outline-none focus:border-orange-500 transition-colors placeholder:text-[#b9afa7]"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-[#797979] mb-1.5 uppercase tracking-wider">
                                Last Name
                            </label>
                            <input
                                type="text"
                                placeholder="Doe"
                                value={lastName}
                                onChange={e => setLastName(e.target.value)}
                                className="w-full px-3 py-2.5 bg-[#fffaf7] border border-[#e8e2db] rounded-lg text-[#181818] text-sm outline-none focus:border-orange-500 transition-colors placeholder:text-[#b9afa7]"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-xs font-semibold text-[#797979] mb-1.5 uppercase tracking-wider">
                            Email *
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b9afa7] pointer-events-none" />
                            <input
                                type="email"
                                placeholder="staff@company.com"
                                value={email}
                                onChange={e => { setEmail(e.target.value); setError(null); }}
                                className="w-full pl-10 pr-3 py-2.5 bg-[#fffaf7] border border-[#e8e2db] rounded-lg text-[#181818] text-sm outline-none focus:border-orange-500 transition-colors placeholder:text-[#b9afa7]"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-xs font-semibold text-[#797979] mb-1.5 uppercase tracking-wider">
                            Password *
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b9afa7] pointer-events-none" />
                            <input
                                type={showPwd ? 'text' : 'password'}
                                placeholder="Minimum 8 characters"
                                value={password}
                                onChange={e => { setPassword(e.target.value); setError(null); }}
                                className="w-full pl-10 pr-10 py-2.5 bg-[#fffaf7] border border-[#e8e2db] rounded-lg text-[#181818] text-sm outline-none focus:border-orange-500 transition-colors placeholder:text-[#b9afa7]"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPwd(v => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b9afa7] hover:text-[#797979] transition-colors"
                            >
                                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        <p className="text-xs text-[#b9afa7] mt-1">Must be at least 8 characters</p>
                    </div>

                    {/* Role info (non-editable) */}
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-orange-500/5 border border-orange-500/20">
                        <Shield className="w-4 h-4 text-orange-500 flex-shrink-0" />
                        <p className="text-xs text-[#797979]">
                            Role: <span className="text-orange-500 font-semibold">Enterprise Staff</span> — assigned automatically
                        </p>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                        {loading
                            ? <><Loader className="w-4 h-4 animate-spin" /> Creating…</>
                            : <><UserPlus className="w-4 h-4" /> Create Staff Account</>
                        }
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EnterpriseDashboard;

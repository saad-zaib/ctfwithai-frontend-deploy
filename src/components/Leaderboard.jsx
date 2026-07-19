import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Loader, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { T } from '../design/tokens';
import Card from './ui/Card';
import { PillTag } from './ui/Badge';

const UserAvatar = ({ userId, username, size = 38, isTop3, rankColor, rankBorder }) => {
  const avatar = userId ? localStorage.getItem(`profileAvatar:${userId}`) : null;
  const initials = (username || '?').slice(0, 2).toUpperCase();
  return avatar ? (
    <img
      src={avatar}
      alt={username}
      style={{
        width: size, height: size, borderRadius: '50%',
        objectFit: 'cover', flexShrink: 0,
        border: `1px solid ${isTop3 ? rankBorder : T.border}`,
      }}
    />
  ) : (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: isTop3 ? rankColor : '#F3F4F6',
      border: `1px solid ${isTop3 ? rankBorder : T.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.34, fontWeight: 800,
      color: isTop3 ? '#fff' : T.text3,
      fontFamily: T.font,
    }}>
      {initials}
    </div>
  );
};

const RANK_COLORS = {
  1: { color: '#D97706', bg: 'rgba(217,119,6,0.06)',  border: 'rgba(217,119,6,0.18)' },
  2: { color: '#9CA3AF', bg: 'rgba(156,163,175,0.06)', border: 'rgba(156,163,175,0.18)' },
  3: { color: '#B45309', bg: 'rgba(180,83,9,0.06)',   border: 'rgba(180,83,9,0.18)' },
};

const getRankIcon = (rank) => {
  const s = { width: 18, height: 18 };
  if (rank === 1) return <Trophy style={{ ...s, color: '#D97706' }} />;
  if (rank === 2) return <Medal  style={{ ...s, color: '#9CA3AF' }} />;
  if (rank === 3) return <Award  style={{ ...s, color: '#B45309' }} />;
  return null;
};

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('all_time');
  const [firstBloods, setFirstBloods] = useState({});
  const API_BASE = process.env.REACT_APP_API_URL || "";

  useEffect(() => {
    fetchLeaderboard();
    fetchFirstBloods();
  }, [timeframe]);

  const fetchFirstBloods = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/stats/feed?limit=100`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
      });
      const data = await res.json();
      const counts = {};
      (data.feed || []).forEach(e => {
        if (e.first_blood) counts[e.user_id] = (counts[e.user_id] || 0) + 1;
      });
      setFirstBloods(counts);
    } catch (_) {}
  };

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      const data = await api.getLeaderboard(100, timeframe);
      setLeaderboard((data.entries || []).filter(e => (e.total_points || 0) > 0));
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  if (isLoading) return (
    <div style={{
      minHeight: '60vh', background: T.pageBg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: T.font,
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 48, height: 48, borderRadius: 13,
          background: T.accentBg, border: `1px solid ${T.accentBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <Loader style={{ width: 22, height: 22, color: T.accent, animation: 'spin 1s linear infinite' }} />
        </div>
        <p style={{ color: T.text3, fontSize: 14, fontWeight: 500 }}>Loading leaderboard…</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={{
      minHeight: '60vh', background: T.pageBg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 32, fontFamily: T.font,
    }}>
      <div style={{
        maxWidth: 420, width: '100%', background: T.cardBg,
        border: '1px solid rgba(239,68,68,0.20)', borderRadius: T.cardRadius,
        padding: 40, textAlign: 'center', boxShadow: T.shadowCardHover,
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: T.errorBg, border: '1px solid rgba(239,68,68,0.16)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px',
        }}>
          <AlertCircle style={{ width: 24, height: 24, color: T.error }} />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: T.text1, marginBottom: 8, letterSpacing: -0.4 }}>
          Error Loading Leaderboard
        </h2>
        <p style={{ color: T.text3, fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>{error}</p>
        <button
          onClick={fetchLeaderboard}
          style={{
            padding: '11px 28px', background: T.accent, border: 'none',
            borderRadius: T.btnRadius, color: '#fff', fontSize: 14,
            fontWeight: 600, cursor: 'pointer', fontFamily: T.font,
          }}
        >
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ background: T.pageBg, minHeight: '100vh', fontFamily: T.font }}>
      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin    { to { transform:rotate(360deg); } }
        .lb-card  { transition: box-shadow 0.22s, transform 0.22s; }
        .lb-card:hover { transform: translateY(-2px) !important; }
        .lb-sweep { transition: width 0.42s ease; }
        .lb-card:hover .lb-sweep { width: 100% !important; }
      `}</style>

      <div style={{ maxWidth: T.contentMaxWidth, margin: '0 auto', padding: '32px' }}>
        {/* Header */}
        <div style={{ marginBottom: 28, animation: 'slideUp 0.4s ease both' }}>
          <h1 style={{
            fontSize: 'clamp(28px,4vw,42px)', fontWeight: 800,
            color: T.text1, letterSpacing: -2, lineHeight: 1.1,
            fontFamily: T.font, marginTop: 10,
          }}>
            Global <span style={{ color: T.accent }}>Leaderboard</span>
          </h1>
          <p style={{ color: T.text3, fontSize: 14, marginTop: 6 }}>
            Top hackers ranked by their achievements
          </p>
        </div>

        {/* Timeframe pills */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, animation: 'slideUp 0.4s ease 0.06s both' }}>
          {['all_time', 'monthly', 'weekly'].map(tf => {
            const active = timeframe === tf;
            const label = tf.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            return (
              <button key={tf} onClick={() => setTimeframe(tf)} style={{
                padding: '8px 18px', height: 36, borderRadius: T.btnRadius,
                fontSize: 13, fontWeight: 600, letterSpacing: -0.1,
                cursor: 'pointer', fontFamily: T.font,
                border: `1px solid ${active ? T.accentBorder : T.border}`,
                background: active ? T.accentBg : T.cardBg,
                color: active ? T.accent : T.text3,
                boxShadow: T.shadowCard, transition: 'all 0.18s ease',
              }}>
                {label}
              </button>
            );
          })}
        </div>

        {/* Empty state */}
        {leaderboard.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '80px 24px', animation: 'slideUp 0.4s ease 0.1s both' }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: T.accentBg, border: `1px solid ${T.accentBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            }}>
              <Trophy style={{ width: 26, height: 26, color: T.accent }} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: T.text1, marginBottom: 8 }}>No Entries Yet</h3>
            <p style={{ color: T.text3, fontSize: 14 }}>Be the first to complete a challenge!</p>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {leaderboard.map((entry, index) => {
              const rank = index + 1;
              const rs = RANK_COLORS[rank];
              const isTop3 = rank <= 3;

              return (
                <div
                  key={entry.user_id || index}
                  className={`lb-card`}
                  style={{
                    position: 'relative', overflow: 'hidden',
                    background: isTop3 ? rs.bg : T.cardBg,
                    border: `1px solid ${isTop3 ? rs.border : T.border}`,
                    borderRadius: T.cardRadius,
                    padding: '20px 24px',
                    boxShadow: T.shadowCard,
                    animation: `slideUp 0.4s ease ${index * 0.04}s both`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
                    {/* Left */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      {/* Rank box */}
                      <div style={{
                        width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                        background: isTop3 ? rs.bg : '#F9F9F9',
                        border: `1px solid ${isTop3 ? rs.border : T.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {getRankIcon(rank) || (
                          <span style={{
                            fontSize: 13, fontWeight: 800, color: T.text3,
                            fontFamily: T.font, fontVariantNumeric: 'tabular-nums',
                          }}>
                            #{rank}
                          </span>
                        )}
                      </div>

                      {/* Avatar */}
                      <UserAvatar
                        userId={entry.user_id}
                        username={entry.username || entry.user_id}
                        size={38}
                        isTop3={isTop3}
                        rankColor={rs?.color}
                        rankBorder={rs?.border}
                      />

                      {/* Name */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <a
                            href={`/user/${encodeURIComponent(entry.username || entry.user_id)}`}
                            style={{
                              fontSize: 15, fontWeight: 700, color: T.text1,
                              fontFamily: T.font, letterSpacing: -0.2, textDecoration: 'none',
                            }}
                            onClick={e => e.stopPropagation()}
                          >
                            {entry.username || entry.user_id}
                          </a>
                          {firstBloods[entry.user_id] > 0 && (
                            <span style={{
                              fontSize: 9, fontWeight: 700, letterSpacing: 0.8,
                              padding: '2px 7px', borderRadius: 5,
                              background: 'rgba(220,38,38,0.07)', color: '#dc2626',
                              border: '1px solid rgba(220,38,38,0.18)',
                              textTransform: 'uppercase', fontFamily: T.font,
                            }}>
                              🩸 {firstBloods[entry.user_id]}x Blood
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: 12, color: T.text3, marginTop: 2, fontFamily: T.fontMono }}>
                          {entry.machines_solved || 0} machines pwned
                        </p>
                      </div>
                    </div>

                    {/* Right: points */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{
                        fontSize: 28, fontWeight: 800,
                        color: isTop3 ? rs.color : T.text1,
                        fontFamily: T.font, letterSpacing: -1, lineHeight: 1,
                        fontVariantNumeric: 'tabular-nums',
                      }}>
                        {(entry.total_points || 0).toLocaleString()}
                      </p>
                      <p style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
                        color: T.text3, fontFamily: T.font, marginTop: 3,
                      }}>
                        points
                      </p>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
                    marginTop: 16, paddingTop: 16,
                    borderTop: `1px solid ${isTop3 ? rs.border : T.border}`,
                  }}>
                    {[
                      { label: 'Machines Solved', val: entry.machines_solved || 0 },
                      { label: 'Total Points',    val: (entry.total_points || 0).toLocaleString() },
                    ].map(s => (
                      <div key={s.label} style={{
                        textAlign: 'center', padding: '10px 8px', borderRadius: 10,
                        background: isTop3 ? 'rgba(255,255,255,0.55)' : '#F9F9F9',
                        border: `1px solid ${isTop3 ? rs.border : T.border}`,
                      }}>
                        <p style={{
                          fontSize: 17, fontWeight: 800,
                          color: isTop3 ? rs.color : T.text1,
                          fontFamily: T.font, lineHeight: 1, fontVariantNumeric: 'tabular-nums',
                        }}>
                          {s.val}
                        </p>
                        <p style={{
                          fontSize: 10, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase',
                          color: T.text3, fontFamily: T.font, marginTop: 4,
                        }}>
                          {s.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Sweep line */}
                  <div
                    className="lb-sweep"
                    style={{
                      position: 'absolute', bottom: 0, left: 0, height: 2,
                      borderRadius: '0 0 20px 20px',
                      background: isTop3
                        ? `linear-gradient(90deg, ${rs.color}, ${rs.color}88)`
                        : `linear-gradient(90deg, ${T.accent}, #fb923c)`,
                      width: '0%',
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;

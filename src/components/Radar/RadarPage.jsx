import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Radar as RadarIcon, Zap, X, Copy, CheckCircle, ArrowRight,
  TrendingUp, Users, Mail, Eye, Loader, Star,
} from 'lucide-react';

// Relationship colors: cold blue → warm orange
const relColor = (v) => {
  const map = { 1: '#93c5fd', 2: '#60a5fa', 3: '#fbbf24', 4: '#f97316', 5: '#ea580c' };
  return map[v] || '#d1d5db';
};
const relLabel = { 1: 'Cold', 2: 'Developing', 3: 'Warm', 4: 'Good', 5: 'Strong' };

// Opportunity score based on relationship + status
function opportunityScore(contact) {
  const base = contact.relationship || 3;
  const statusBonus = contact.status === 'Follow Up' ? 1 : contact.status === 'Connected' ? 0 : -1;
  return Math.min(5, Math.max(1, base + statusBonus));
}

// Ghost email scenarios
const SCENARIOS = ['Check-in', 'Proposal Follow-up', 'Re-engage', 'Post-Project', 'Rate Increase', 'Thank You'];
const TONES = ['Friendly', 'Professional', 'Direct'];

function ghostDraft(scenario, tone, contact) {
  const first = contact.name.split(' ')[0];
  const co = contact.company || 'your team';
  const proj = contact.last_project || 'our last project';

  const templates = {
    'Check-in': {
      Friendly: `Subject: Checking in — hope things are going well at ${co}!\n\nHi ${first},\n\nHope you've been well! It's been a little while since we wrapped up ${proj} together, and I wanted to check in to see how things are going at ${co}.\n\nIs there anything in the pipeline I could help with? Always happy to grab a quick call.\n\nWarm regards`,
      Professional: `Subject: Checking in — ${co}\n\nHi ${first},\n\nI hope things are going well at ${co}. I wanted to reach out following our work on ${proj} and see if there are any upcoming projects where I could be of assistance.\n\nI'm available for a brief call this week if that would be useful.\n\nBest regards`,
      Direct: `Subject: Quick check-in\n\nHi ${first},\n\nChecking in post-${proj}. Anything on the horizon at ${co} I can help with? Happy to jump on a call.\n\nBest`,
    },
    'Re-engage': {
      Friendly: `Subject: Long time no speak — hope ${co} is flying!\n\nHi ${first},\n\nIt feels like ages since we worked on ${proj} together! I've been thinking about ${co} and wanted to drop a line to see how things are going.\n\nIf there's anything creative on the horizon, I'd love to hear about it.\n\nWarm regards`,
      Professional: `Subject: Re-connecting — ${co}\n\nHi ${first},\n\nI hope Q2 has been strong for ${co}. I wanted to reach out as it's been a few months since ${proj}, and I'd love to explore whether there are upcoming projects where I could add value.\n\nWould a brief call this week work?\n\nBest`,
      Direct: `Subject: Reconnecting — ${co}\n\nHi ${first},\n\nBeen a while since ${proj}. Any new briefs at ${co} I should know about? Let's find 20 minutes.\n\nBest`,
    },
    'Proposal Follow-up': {
      Friendly: `Subject: Following up on the proposal!\n\nHi ${first},\n\nJust wanted to follow up on the proposal I sent over for ${co}. No pressure — I just wanted to make sure it landed and answer any questions.\n\nHappy to hop on a quick call if that helps!\n\nWarm regards`,
      Professional: `Subject: Proposal follow-up — ${co}\n\nHi ${first},\n\nI wanted to follow up on the proposal I submitted. I'd welcome the opportunity to discuss any questions or adjustments.\n\nPlease let me know if you'd like to schedule a brief call.\n\nBest regards`,
      Direct: `Subject: Proposal — your thoughts?\n\nHi ${first},\n\nFollowing up on the proposal for ${co}. Have you had a chance to review it? Happy to adjust scope if needed.\n\nBest`,
    },
    'Post-Project': {
      Friendly: `Subject: Loved working on ${proj} with you!\n\nHi ${first},\n\nNow that ${proj} is wrapped up, I just wanted to say how much I enjoyed working with you and the team at ${co}. It was a really satisfying project.\n\nIf you have a moment, I'd genuinely appreciate a short testimonial — and I'd love to work together again!\n\nWarmly`,
      Professional: `Subject: Project wrap — ${proj}\n\nHi ${first},\n\nNow that ${proj} has concluded, I wanted to thank you and the ${co} team for the collaboration. If you'd be willing to share a brief testimonial, I'd greatly appreciate it.\n\nBest regards`,
      Direct: `Subject: ${proj} — done!\n\nHi ${first},\n\nGreat working with you on ${proj}. Hope the results land well. If you can leave a quick review, that'd be brilliant.\n\nBest`,
    },
    'Rate Increase': {
      Friendly: `Subject: A heads-up on my rates for upcoming projects\n\nHi ${first},\n\nI wanted to give you a heads-up before any new briefs come in — I'm updating my day rates from next quarter. My new rate will be S$X/day. Existing projects won't be affected.\n\nHappy to chat through anything.\n\nWarm regards`,
      Professional: `Subject: Rate update — effective [date]\n\nHi ${first},\n\nI wanted to give advance notice that I will be updating my day rate to S$X effective [date]. This change will apply to new project scopes only.\n\nBest regards`,
      Direct: `Subject: Rate increase notice\n\nHi ${first},\n\nRates going up to S$X/day from [date]. Wanted to give you early notice so you can plan budgets accordingly.\n\nBest`,
    },
    'Thank You': {
      Friendly: `Subject: Thank you — it was a pleasure!\n\nHi ${first},\n\nJust a quick note to say a genuine thank you for choosing to work with me on ${proj}. It was a real pleasure.\n\nWorking with the ${co} team was a highlight — you made the process smooth and collaborative.\n\nWith thanks`,
      Professional: `Subject: Thank you for the collaboration\n\nHi ${first},\n\nI wanted to take a moment to thank you and the team at ${co} for the opportunity to work on ${proj}.\n\nKind regards`,
      Direct: `Subject: Thanks — great project\n\nHi ${first},\n\nReally enjoyed working on ${proj} with you. The ${co} team made it easy. Hope to collaborate again soon.\n\nBest`,
    },
  };

  return (templates[scenario]?.[tone] || templates['Check-in'].Friendly) + '\nLing';
}

function GhostPanel({ contact, onClose }) {
  const [scenario, setScenario] = useState('Check-in');
  const [tone, setTone] = useState('Friendly');
  const [copied, setCopied] = useState(false);

  const draft = ghostDraft(scenario, tone, contact);

  const copy = () => {
    navigator.clipboard.writeText(draft).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed', right: 0, top: 0, bottom: 0, width: 420,
      background: '#fff', boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
      zIndex: 200, display: 'flex', flexDirection: 'column',
      borderLeft: '1px solid var(--border)',
    }}>
      <div style={{
        padding: '18px 20px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Ghost — {contact.name}</div>
          <div style={{ fontSize: 12, color: 'var(--slate-400)', marginTop: 2 }}>{contact.company}</div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}>
          <X size={18} />
        </button>
      </div>

      <div style={{ padding: '16px 20px', flex: 1, overflowY: 'auto' }}>
        {/* Scenario */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Scenario</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {SCENARIOS.map(sc => (
              <button key={sc} onClick={() => setScenario(sc)} style={{
                padding: '4px 10px', borderRadius: 999, border: '1.5px solid',
                borderColor: scenario === sc ? 'var(--amber)' : 'var(--border)',
                background: scenario === sc ? 'var(--amber)' : '#fff',
                color: scenario === sc ? '#fff' : 'var(--slate-600)',
                fontSize: 12, fontWeight: 500, cursor: 'pointer',
              }}>
                {sc}
              </button>
            ))}
          </div>
        </div>

        {/* Tone */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Tone</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {TONES.map(t => (
              <button key={t} onClick={() => setTone(t)} style={{
                padding: '4px 14px', borderRadius: 999, border: '1.5px solid',
                borderColor: tone === t ? 'var(--amber)' : 'var(--border)',
                background: tone === t ? 'var(--amber)' : '#fff',
                color: tone === t ? '#fff' : 'var(--slate-600)',
                fontSize: 12, fontWeight: 500, cursor: 'pointer',
              }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Draft */}
        <div style={{
          background: 'var(--slate-50)', border: '1px solid var(--border)',
          borderRadius: 10, padding: 16,
          fontSize: 13, color: 'var(--slate-900)', lineHeight: 1.7,
          whiteSpace: 'pre-wrap', fontFamily: 'inherit',
        }}>
          {draft}
        </div>
      </div>

      <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
        <button onClick={copy} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
          {copied ? <><CheckCircle size={14} /> Copied!</> : <><Copy size={14} /> Copy draft</>}
        </button>
        <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
          <Mail size={14} /> Open in Mail
        </button>
      </div>
    </div>
  );
}

export default function RadarPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ghostContact, setGhostContact] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All'); // All | Follow Up | Connected | No Action for Now

  useEffect(() => {
    fetchContacts();
  }, []);

  async function fetchContacts() {
    setLoading(true);
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('archived', false)
      .order('updated_at', { ascending: false });
    if (!error && data) setContacts(data.map(r => ({
      id: r.id,
      name: r.name,
      company: r.company || '',
      job_title: r.job_title || '',
      status: r.status || 'Follow Up',
      relationship: r.relationship || 3,
      last_project: r.last_project || '',
      last_project_date: r.last_project_date || '',
      ltv: Number(r.ltv) || 0,
      last_interaction: r.last_interaction || '',
      email: r.email || '',
    })));
    setLoading(false);
  }

  const filtered = contacts.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.company.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || c.status === filter;
    return matchSearch && matchFilter;
  });

  // Sort by opportunity score desc
  const sorted = [...filtered].sort((a, b) => opportunityScore(b) - opportunityScore(a));

  // "Today's focus" = top 3 follow-up contacts
  const todayFocus = contacts
    .filter(c => c.status === 'Follow Up')
    .sort((a, b) => (b.relationship || 0) - (a.relationship || 0))
    .slice(0, 3);

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
          }}>
            <RadarIcon size={22} color="#fff" />
          </div>
          <div>
            <h1 className="page-title" style={{ marginBottom: 2 }}>Radar</h1>
            <div style={{ fontSize: 13, color: 'var(--slate-500)' }}>
              AI relationship intelligence — know who to reach out to, and what to say
            </div>
          </div>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.5px',
            background: 'var(--amber)', color: 'var(--slate-900)',
            padding: '3px 8px', borderRadius: 4,
          }}>AI</span>
        </div>
      </div>

      {/* Today's Focus */}
      {todayFocus.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--slate-700)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Zap size={14} color="var(--amber)" fill="var(--amber)" />
            Today's Focus
            <span style={{ fontSize: 12, color: 'var(--slate-400)', fontWeight: 400 }}>— contacts Flint recommends reaching out to today</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {todayFocus.map(c => (
              <div key={c.id} style={{
                background: '#fff', border: '1.5px solid var(--amber-light)',
                borderRadius: 12, padding: '14px 16px',
                boxShadow: 'var(--shadow-xs)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 9,
                    background: relColor(c.relationship),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0,
                  }}>
                    {c.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--slate-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--slate-500)' }}>{c.company}</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--slate-500)', marginBottom: 12, lineHeight: 1.4 }}>
                  {c.last_project ? `Last project: ${c.last_project}${c.last_project_date ? ` · ${c.last_project_date}` : ''}` : 'No project history yet'}
                </div>
                <button
                  onClick={() => setGhostContact(c)}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', justifyContent: 'center', fontSize: 12 }}
                >
                  <Mail size={13} /> Draft outreach with Ghost
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <input
            className="form-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search contacts…"
            style={{ paddingLeft: 36 }}
          />
          <RadarIcon size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
        </div>
        {['All', 'Follow Up', 'Connected', 'No Action for Now'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '7px 14px', borderRadius: 8, border: '1.5px solid',
            borderColor: filter === f ? 'var(--amber)' : 'var(--border)',
            background: filter === f ? 'var(--amber-tint)' : '#fff',
            color: filter === f ? 'var(--amber-dark)' : 'var(--slate-600)',
            fontSize: 13, fontWeight: filter === f ? 600 : 400, cursor: 'pointer',
          }}>
            {f}
          </button>
        ))}
      </div>

      {/* Contact list */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80, gap: 12, color: 'var(--slate-400)' }}>
          <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} /> Loading contacts…
        </div>
      ) : sorted.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, color: 'var(--slate-400)' }}>
          <RadarIcon size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No contacts yet</div>
          <div style={{ fontSize: 13 }}>Add contacts from the Contacts page and Radar will surface intelligence for them.</div>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Contact</th>
                <th>Opportunity</th>
                <th>Relationship</th>
                <th>Status</th>
                <th>Lifetime Value</th>
                <th>Last Project</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(c => {
                const score = opportunityScore(c);
                return (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                          background: relColor(c.relationship),
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 700, color: '#fff',
                        }}>
                          {c.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--slate-900)' }}>{c.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--slate-400)' }}>{c.company}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 3 }}>
                        {[1,2,3,4,5].map(i => (
                          <div key={i} style={{
                            width: 8, height: 8, borderRadius: '50%',
                            background: i <= score ? 'var(--amber)' : 'var(--slate-200)',
                          }} />
                        ))}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{
                          width: 10, height: 10, borderRadius: '50%',
                          background: relColor(c.relationship),
                        }} />
                        <span style={{ fontSize: 13, color: 'var(--slate-700)', fontWeight: 500 }}>
                          {relLabel[c.relationship] || 'Warm'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                        background: c.status === 'Follow Up' ? '#fef3c7' : c.status === 'Connected' ? '#d1fae5' : '#f3f4f6',
                        color: c.status === 'Follow Up' ? '#92400e' : c.status === 'Connected' ? '#065f46' : '#4b5563',
                      }}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--slate-900)' }}>
                      {c.ltv > 0 ? `S$${c.ltv.toLocaleString()}` : '—'}
                    </td>
                    <td style={{ color: 'var(--slate-500)', fontSize: 13 }}>
                      {c.last_project || '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => setGhostContact(c)}
                          style={{
                            padding: '4px 10px', borderRadius: 6, border: 'none',
                            background: 'var(--amber-tint)', color: 'var(--amber-dark)',
                            fontSize: 11, fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 4,
                          }}
                        >
                          <Mail size={11} /> Ghost
                        </button>
                        <button
                          style={{
                            padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)',
                            background: '#fff', color: 'var(--slate-600)',
                            fontSize: 11, fontWeight: 500, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 4,
                          }}
                        >
                          <Eye size={11} /> Intel
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Ghost email panel */}
      {ghostContact && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 199, background: 'rgba(0,0,0,0.2)' }} onClick={() => setGhostContact(null)} />
          <GhostPanel contact={ghostContact} onClose={() => setGhostContact(null)} />
        </>
      )}

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}

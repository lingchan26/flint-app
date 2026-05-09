import { useState, useRef, useEffect } from 'react';
import { Plus, X, MoreVertical, CheckCircle, BookUser } from 'lucide-react';

const initialContacts = [
  {
    id: 1, name: 'Sarah Kim', email: 'sarah@lumenco.com', phone: '+65 9123 4567',
    company: 'Lumen Co', lastInteraction: '2 Apr 2026', tags: ['Client', 'Active'],
    jobTitle: 'Brand Manager', status: 'Connected', notes: 'Key decision maker for brand projects.',
    ltv: 28500, relationship: 5, lastProject: 'Brand Refresh', lastProjectDate: 'Mar 2026',
    archived: false,
  },
  {
    id: 2, name: 'James Tan', email: 'james@vertex.com', phone: '+65 9234 5678',
    company: 'Vertex Inc', lastInteraction: '28 Mar 2026', tags: ['Client'],
    jobTitle: 'CFO', status: 'Follow Up', notes: '',
    ltv: 22000, relationship: 4, lastProject: 'Annual Report', lastProjectDate: 'Apr 2026',
    archived: false,
  },
  {
    id: 3, name: 'Mia Ng', email: 'mia@bloomfoods.sg', phone: '+65 9345 6789',
    company: 'Bloom Foods', lastInteraction: '20 Mar 2026', tags: ['Client', 'Lead'],
    jobTitle: 'Marketing Director', status: 'Connected', notes: 'Interested in seasonal campaigns.',
    ltv: 4200, relationship: 3, lastProject: 'Packaging Design', lastProjectDate: 'Feb 2026',
    archived: false,
  },
  {
    id: 4, name: 'Ryan Loh', email: 'ryan@kova.io', phone: '+65 9456 7890',
    company: 'Kova Studio', lastInteraction: '15 Mar 2026', tags: ['Client'],
    jobTitle: 'Creative Director', status: 'Qualified', notes: '',
    ltv: 9200, relationship: 4, lastProject: 'Social Media Kit', lastProjectDate: 'Jan 2026',
    archived: false,
  },
  {
    id: 5, name: 'Chloe Park', email: 'chloe@arko.media', phone: '+82 10 1234 5678',
    company: 'Arko Media', lastInteraction: '10 Feb 2026', tags: ['Inactive'],
    jobTitle: 'Producer', status: 'Not Relevant', notes: '',
    ltv: 7800, relationship: 2, lastProject: 'Motion Graphics', lastProjectDate: 'Nov 2025',
    archived: false,
  },
  {
    id: 6, name: 'Dave Chen', email: 'dave@novu.tech', phone: '+65 9567 8901',
    company: 'Novu Tech', lastInteraction: '1 Apr 2026', tags: ['Lead'],
    jobTitle: 'CEO', status: 'Follow Up', notes: 'Met at DesignSG event.',
    ltv: 15000, relationship: 3, lastProject: 'Website Redesign', lastProjectDate: 'Apr 2026',
    archived: false,
  },
  {
    id: 7, name: 'Priya Rajan', email: 'priya@prism.co', phone: '+65 9678 9012',
    company: 'Prism Labs', lastInteraction: '25 Mar 2026', tags: ['Lead'],
    jobTitle: 'Head of Marketing', status: 'Qualified', notes: 'Enquired about CGI services.',
    ltv: 9200, relationship: 2, lastProject: 'CGI Renders', lastProjectDate: 'Mar 2026',
    archived: false,
  },
];

const STATUS_OPTS = ['Follow Up', 'Connected', 'Qualified', 'Not Relevant'];

const statusStyle = {
  'Follow Up':    { background: '#fef3c7', color: '#92400e' },
  'Connected':    { background: '#d1fae5', color: '#065f46' },
  'Qualified':    { background: '#dbeafe', color: '#1e40af' },
  'Not Relevant': { background: '#f3f4f6', color: '#4b5563' },
};

const relationshipLabel = { 5: 'Strong', 4: 'Good', 3: 'Warm', 2: 'Developing', 1: 'Cold' };
const relationshipColor = { 5: '#10b981', 4: '#3b82f6', 3: '#f59e0b', 2: '#9ca3af', 1: '#ef4444' };

const radarData = {
  1: {
    company: [
      { text: 'Lumen Co posted 3 new marketing roles on LinkedIn — possible brand expansion', time: '2 days ago' },
      { text: 'Lumen Co featured in Marketing Week Singapore as "Brand to Watch"', time: '1 week ago' },
    ],
    opportunity: [
      { text: 'Last project completed 2 months ago — good time for a check-in', time: 'Flagged by Flint' },
      { text: 'Q2 budget season — many companies finalise creative briefs in April', time: 'Seasonal insight' },
    ],
    pay: { score: 5, label: 'Excellent Payer', detail: 'Pays within 7 days on average · 0 overdue invoices · 3 payments received' },
  },
  2: {
    company: [
      { text: 'Vertex Inc reported 18% revenue growth in Q1 2026 — expanding teams', time: '3 days ago' },
      { text: 'New CFO (James Tan) joined from KPMG — potential for new strategic projects', time: '2 weeks ago' },
    ],
    opportunity: [
      { text: 'Annual report season approaching — last engagement was in Q1', time: 'Flagged by Flint' },
      { text: 'Finance sector showing increased demand for brand communications', time: 'Industry insight' },
    ],
    pay: { score: 4, label: 'Good Payer', detail: 'Pays within 14 days on average · 1 overdue invoice (resolved) · 2 payments received' },
  },
  3: {
    company: [
      { text: 'Bloom Foods launched 2 new SKUs — packaging refresh opportunity', time: '1 week ago' },
      { text: 'Featured in Straits Times food supplement as "Rising Local Brand"', time: '10 days ago' },
    ],
    opportunity: [
      { text: 'Seasonal campaign period coming up — Q3 summer products', time: 'Seasonal insight' },
      { text: 'Last packaging project well received — good repeat potential', time: 'Flagged by Flint' },
    ],
    pay: { score: 3, label: 'Average Payer', detail: 'Pays within 21 days on average · 1 overdue invoice · 1 payment received' },
  },
  4: {
    company: [
      { text: 'Kova Studio won Asia Creative Awards 2026 — increased visibility', time: '5 days ago' },
      { text: 'Expanding to Malaysia market — may need localised creative assets', time: '2 weeks ago' },
    ],
    opportunity: [
      { text: 'Social media strategy overhaul likely post-award — ideal time to reach out', time: 'Flagged by Flint' },
      { text: 'Creative industry growing at 12% in SEA — strong client pipeline', time: 'Industry insight' },
    ],
    pay: { score: 4, label: 'Good Payer', detail: 'Pays within 10 days on average · 0 overdue invoices · 2 payments received' },
  },
  5: {
    company: [
      { text: 'Arko Media has been quiet on social channels for 3 months', time: 'Observation' },
      { text: 'Producer role (Chloe Park) may be transitioning — check in', time: 'Flagged by Flint' },
    ],
    opportunity: [
      { text: 'No active project in 5 months — worth a warm re-engagement', time: 'Flagged by Flint' },
      { text: 'Media production spending up in Q2 — seasonal buying cycle', time: 'Seasonal insight' },
    ],
    pay: { score: 3, label: 'Average Payer', detail: 'Pays within 18 days on average · 0 overdue invoices · 1 payment received' },
  },
  6: {
    company: [
      { text: 'Novu Tech raised Series A — S$8M, expanding product and brand team', time: '4 days ago' },
      { text: 'Actively hiring UX and brand roles on LinkedIn', time: '1 week ago' },
    ],
    opportunity: [
      { text: 'Website redesign in progress — follow up on deliverables timeline', time: 'Flagged by Flint' },
      { text: 'Fast-growing SaaS brands often need ongoing brand support', time: 'Industry insight' },
    ],
    pay: { score: 5, label: 'Excellent Payer', detail: 'Pays within 7 days on average · 0 overdue invoices · 1 payment received' },
  },
  7: {
    company: [
      { text: 'Prism Labs shortlisted for SG Innovation Award 2026', time: '1 week ago' },
      { text: 'Expanding CGI team — may bring more creative work in-house', time: '2 weeks ago' },
    ],
    opportunity: [
      { text: 'Enquiry from 2 months ago — no follow-up logged yet', time: 'Flagged by Flint' },
      { text: 'CGI demand surging in product marketing — right time to pitch', time: 'Industry insight' },
    ],
    pay: { score: 2, label: 'Slow Payer', detail: 'Pays within 30 days on average · No invoices sent yet' },
  },
};

// Ghost tab email drafts — 8 scenarios × 3 tones
const ghostDrafts = {
  'Check-in': {
    Friendly: (c) => `Subject: Checking in — hope things are going well at ${c.company}!

Hi ${c.firstName},

Hope you've been well! It's been a little while since we wrapped up ${c.lastProject} together, and I wanted to check in to see how things are going at ${c.company}.

Is there anything in the pipeline we could help with? Always happy to grab a quick call if there's anything brewing.

Warm regards,
Ling`,
    Professional: (c) => `Subject: Checking in — ${c.company}

Hi ${c.firstName},

I hope things are going well at ${c.company}. I wanted to reach out following our work on ${c.lastProject} and see if there are any upcoming projects where I could be of assistance.

I'm available for a brief call this week if that would be useful.

Best regards,
Ling`,
    Direct: (c) => `Subject: Quick check-in

Hi ${c.firstName},

Just checking in post-${c.lastProject}. Anything on the horizon at ${c.company} I can help with?

Happy to jump on a call.

Ling`,
  },
  'Proposal Follow-up': {
    Friendly: (c) => `Subject: Following up on the proposal — any questions?

Hi ${c.firstName},

Just wanted to follow up on the proposal I sent over for the upcoming project at ${c.company}. I know things can get busy, so no pressure at all — I just wanted to make sure it landed and answer any questions you might have!

If anything needs tweaking or you'd like to hop on a quick call to talk through it, I'm very happy to do that.

Looking forward to hearing from you!

Warm regards,
Ling`,
    Professional: (c) => `Subject: Proposal follow-up — ${c.company}

Hi ${c.firstName},

I wanted to follow up on the proposal I submitted for ${c.company}. I'd welcome the opportunity to discuss any questions or adjustments you may have in mind.

Please let me know if you'd like to schedule a brief call at your convenience.

Best regards,
Ling`,
    Direct: (c) => `Subject: Proposal — your thoughts?

Hi ${c.firstName},

Following up on the proposal I sent for ${c.company}. Have you had a chance to review it?

Happy to adjust scope or pricing if needed. Just let me know.

Ling`,
  },
  'Invoice Chase': {
    Friendly: (c) => `Subject: Gentle reminder — invoice from our recent project

Hi ${c.firstName},

Hope things are well at ${c.company}! I just wanted to send a friendly reminder about the outstanding invoice from our ${c.lastProject} project — I know how easy it is for these to slip through the cracks when things are busy.

Could you let me know the expected payment date when you get a moment? Really appreciate it!

Thanks so much,
Ling`,
    Professional: (c) => `Subject: Invoice payment reminder — ${c.lastProject}

Hi ${c.firstName},

I'm writing to follow up on the outstanding invoice related to our ${c.lastProject} engagement at ${c.company}. As of today, payment has not yet been received.

Could you please advise on the expected payment date? If there are any issues I can help resolve, do let me know.

Thank you,
Ling`,
    Direct: (c) => `Subject: Invoice overdue — action required

Hi ${c.firstName},

The invoice for ${c.lastProject} is now overdue. Could you confirm payment status and let me know the expected settlement date?

If there's a hold-up, please let me know so we can sort it quickly.

Thanks,
Ling`,
  },
  'Re-engage': {
    Friendly: (c) => `Subject: Long time no speak — hope ${c.company} is flying!

Hi ${c.firstName},

It feels like ages since we worked on ${c.lastProject} together — time flies! I've been thinking about ${c.company} lately and wanted to drop a line to see how things are going.

If there's anything creative on the horizon, I'd love to hear about it. Even just a catch-up would be great!

Hope to hear from you soon.

Warm regards,
Ling`,
    Professional: (c) => `Subject: Re: Creative collaboration — ${c.company}

Hi ${c.firstName},

I hope Q2 has been a strong one for ${c.company}. I wanted to reach out as it's been a few months since ${c.lastProject}, and I'd love to explore whether there are any upcoming projects where we could add value.

Would a brief 20-minute call this week work to reconnect?

Best,
Ling`,
    Direct: (c) => `Subject: Reconnecting — ${c.company}

Hi ${c.firstName},

It's been a while since ${c.lastProject}. Any new briefs or projects coming up at ${c.company} I should know about?

Let's find 20 minutes to catch up.

Ling`,
  },
  'Post-Project': {
    Friendly: (c) => `Subject: Loved working on ${c.lastProject} with you!

Hi ${c.firstName},

Now that ${c.lastProject} is wrapped up, I just wanted to say how much I enjoyed working with you and the team at ${c.company}. It was a really satisfying project and I'm proud of what we created together.

If you have a moment, I'd genuinely appreciate a short testimonial or review — it means a lot for independent creatives like me. And of course, I'd love to work together again whenever the next brief lands!

Thanks again for a great collaboration.

Warmly,
Ling`,
    Professional: (c) => `Subject: Project wrap — ${c.lastProject}

Hi ${c.firstName},

Now that ${c.lastProject} has concluded, I wanted to reach out and thank you and the team at ${c.company} for the collaboration.

If you'd be willing to share a brief testimonial or review of the work, I'd greatly appreciate it. I look forward to working together on future projects.

Best regards,
Ling`,
    Direct: (c) => `Subject: ${c.lastProject} — done!

Hi ${c.firstName},

Great working with you on ${c.lastProject}. Hope the results land well for the team.

If you're able to leave a quick review, that'd be brilliant. And I'm ready for the next brief whenever you are.

Ling`,
  },
  'Rate Increase': {
    Friendly: (c) => `Subject: A heads-up on my rates for upcoming projects

Hi ${c.firstName},

I hope things are going well at ${c.company}! I wanted to give you a heads-up before any new briefs come in — I'm updating my day rates from next quarter to reflect the current market and the scope of work I typically deliver.

My new rate will be S$X/day (previously S$Y). This will apply to all new projects from [date]. Existing projects in progress won't be affected.

I really value our working relationship and wanted to be upfront well in advance. Happy to jump on a quick call if you'd like to chat through anything.

Warm regards,
Ling`,
    Professional: (c) => `Subject: Rate update — effective [date]

Hi ${c.firstName},

I wanted to give you advance notice that I will be updating my day rate to S$X effective [date], reflecting the scope and quality of work I deliver for clients like ${c.company}.

All ongoing commitments will remain at current rates. This change will apply to new project scopes only. Please don't hesitate to reach out if you have any questions.

Best regards,
Ling`,
    Direct: (c) => `Subject: Rate increase notice

Hi ${c.firstName},

My rates are going up to S$X/day from [date]. Wanted to give you early notice so you can plan budgets accordingly.

Current rates locked in for any briefs confirmed before then.

Ling`,
  },
  'Scope Pushback': {
    Friendly: (c) => `Subject: Quick note on the project scope

Hi ${c.firstName},

Hope you're well! I wanted to flag something before we go further — looking at where we are on the project, we've moved a fair bit beyond the original brief. I totally get that things evolve, and I've been happy to accommodate along the way!

That said, I think it makes sense for us to have a quick chat about scope so we're aligned on what's included going forward and what might need a separate conversation on budget. I don't want there to be any surprises for either of us.

Does a 15-minute call this week work?

Warmly,
Ling`,
    Professional: (c) => `Subject: Project scope — clarification required

Hi ${c.firstName},

I'm writing to flag that the current project has expanded beyond the scope outlined in our original agreement. While I've been accommodating of the additional requests, I'd like to schedule a brief call to align on scope boundaries and discuss any necessary adjustments to the project fee.

Please let me know your availability this week.

Regards,
Ling`,
    Direct: (c) => `Subject: Scope has grown — we need to talk

Hi ${c.firstName},

The project has gone beyond the original brief. I've been flexible, but we're now at a point where the additional work needs to be scoped and priced properly.

Can we do 15 minutes this week to get aligned?

Ling`,
  },
  'Thank You': {
    Friendly: (c) => `Subject: Thank you — it was a pleasure!

Hi ${c.firstName},

Just a quick note to say a genuine thank you for choosing to work with me on ${c.lastProject}. It was a real pleasure, and I'm so glad we got to create something we're both proud of.

Working with the ${c.company} team was a highlight — you made the process smooth and collaborative, which makes a huge difference.

I hope we get to work together again soon. In the meantime, if you ever need anything, I'm just a message away!

With thanks,
Ling`,
    Professional: (c) => `Subject: Thank you for the collaboration

Hi ${c.firstName},

I wanted to take a moment to thank you and the team at ${c.company} for the opportunity to work on ${c.lastProject}. It was a pleasure collaborating with you, and I'm pleased with what we achieved together.

I look forward to the possibility of working together on future projects.

Kind regards,
Ling`,
    Direct: (c) => `Subject: Thanks — great project

Hi ${c.firstName},

Really enjoyed working on ${c.lastProject} with you. The ${c.company} team made it easy.

Hope to collaborate again soon.

Ling`,
  },
};

const talkingPoints = {
  1: [
    "Reference their 'Brand to Watch' recognition — they'll appreciate you noticed",
    "Ask about the 3 new marketing hires — potential team briefing opportunity",
    "Their Q2 budget is likely finalised — good time to table a retainer conversation",
  ],
  2: [
    "Acknowledge Q1 growth — shows you follow their business",
    "Annual report project — explore if they want a 2026 edition brief",
    "New CFO angle — finance brands often need updated investor communications",
  ],
  3: [
    "2 new SKUs launched — ask which needs packaging refresh first",
    "Their Straits Times feature is worth referencing — brand pride moment",
    "Seasonal campaign timing — plant the seed for Q3 shoot brief",
  ],
  4: [
    "Congratulate on Asia Creative Awards — genuine relationship moment",
    "Malaysia expansion may need localised creative — explore scope",
    "Post-award brand refresh is common — is a rebrand on the cards?",
  ],
};

const expandRoles = {
  1: [
    { icon: '🎯', role: 'CMO / Marketing Director', rationale: 'Budget holder for creative work. Getting in front of them reduces project approval delays.' },
    { icon: '👥', role: 'Head of Digital', rationale: 'Often commissions social and digital campaigns separately. Cross-sell opportunity.' },
    { icon: '🔧', role: 'Project Manager / Creative Operations', rationale: "Your day-to-day delivery partner. Reduces Sarah's dependency on the relationship." },
  ],
  2: [
    { icon: '🎯', role: 'CEO / Managing Director', rationale: 'Strategic narrative and investor comms often come from the top. Worth a warm intro.' },
    { icon: '📣', role: 'Head of Comms / PR', rationale: 'Annual report often driven by comms team. Could be a direct brief.' },
    { icon: '🏗', role: 'Head of Strategy', rationale: 'Often leads brand positioning projects alongside finance.' },
  ],
  3: [
    { icon: '🎯', role: 'CEO / Founder', rationale: 'Food brand founders are often closely involved in creative direction. A direct relationship adds value.' },
    { icon: '📦', role: 'Head of Product', rationale: 'New SKU launches are driven by product team. Early conversations = earlier briefs.' },
    { icon: '🛒', role: 'Retail / Channel Manager', rationale: 'Retail packaging needs often come from this team — a warm intro could unlock new briefs.' },
  ],
  4: [
    { icon: '🎯', role: 'Managing Director / CEO', rationale: 'Award-winning studios often have founders driving strategic brand decisions. Worth connecting.' },
    { icon: '🌏', role: 'Head of Business Development', rationale: 'Malaysia expansion requires market-specific creative — BD leads often manage these briefs.' },
    { icon: '📱', role: 'Social Media / Content Manager', rationale: 'Social media kits often spawn ongoing content retainers. A direct relationship here pays off.' },
  ],
};

function getDefaultExpandRoles(contact) {
  return [
    { icon: '🎯', role: 'Senior Decision Maker', rationale: `Budget holder at ${contact.company}. Building a relationship at the top reduces approval friction.` },
    { icon: '👥', role: 'Head of Marketing / Comms', rationale: 'Often commissions creative work directly. A key stakeholder for ongoing project briefs.' },
    { icon: '🔧', role: 'Project / Operations Manager', rationale: 'Your practical day-to-day partner. Smooth delivery builds trust across the organisation.' },
  ];
}

function getDefaultTalkingPoints(contact) {
  const data = radarData[contact.id];
  const signal = data && data.company[0] ? data.company[0].text : 'their recent work';
  return [
    `Reference their latest news — ${signal.slice(0, 60)}...`,
    `Ask what's coming up in the next quarter — position yourself for early briefs`,
    `Follow up on ${contact.lastProject || 'your last project'} results — show genuine interest in outcomes`,
  ];
}

function RelationshipDots({ value, onChange }) {
  return (
    <div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 3 }}>
        {[1,2,3,4,5].map(i => (
          <button
            key={i}
            onClick={() => onChange && onChange(i)}
            style={{
              width: 12, height: 12, borderRadius: '50%', border: 'none',
              background: i <= value ? '#f59e0b' : '#e5e0d8',
              cursor: onChange ? 'pointer' : 'default',
              padding: 0,
              transition: 'background 0.15s',
            }}
          />
        ))}
      </div>
      <div style={{ fontSize: 10, color: relationshipColor[value] || '#9ca3af', fontWeight: 500 }}>
        {relationshipLabel[value] || ''}
      </div>
    </div>
  );
}

function StatusDropdown({ contactId, current, onChange, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div ref={ref} style={{
      position: 'absolute', top: 32, left: 0, zIndex: 50,
      background: '#fff', border: '1px solid #e5e0d8', borderRadius: 10,
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: 150, overflow: 'hidden',
    }}>
      {STATUS_OPTS.map(s => (
        <button
          key={s}
          onClick={() => { onChange(contactId, s); onClose(); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 14px', fontSize: 13, color: '#1a1a1a',
            cursor: 'pointer', background: 'none', border: 'none',
            width: '100%', textAlign: 'left',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#faf8f4'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <span style={{
            ...statusStyle[s],
            padding: '1px 8px', borderRadius: 20, fontSize: 11, fontWeight: 500,
          }}>
            {s}
          </span>
        </button>
      ))}
    </div>
  );
}

function PayScoreStars({ score }) {
  const stars = '★'.repeat(score) + '☆'.repeat(5 - score);
  const colors = { 5: '#10b981', 4: '#3b82f6', 3: '#f59e0b', 2: '#ef4444', 1: '#ef4444' };
  return <span style={{ color: colors[score] || '#9ca3af', fontSize: 14 }}>{stars}</span>;
}

function RadarPanel({ contact, onClose, showToast }) {
  const [radarTab, setRadarTab] = useState('Intel');
  const [ghostScenario, setGhostScenario] = useState('Check-in');
  const [ghostTone, setGhostTone] = useState('Friendly');
  const [expandGhostPrefill, setExpandGhostPrefill] = useState(null);

  const data = radarData[contact.id] || radarData[1];
  const payBg = data.pay.score >= 4 ? '#d1fae5' : data.pay.score === 3 ? '#fef3c7' : '#fee2e2';
  const payColor = data.pay.score >= 4 ? '#065f46' : data.pay.score === 3 ? '#92400e' : '#991b1b';

  const firstName = contact.name.split(' ')[0];
  const contactWithFirst = { ...contact, firstName };

  const relLabel = relationshipLabel[contact.relationship] || 'Warm';
  const payLabel = data.pay.label;
  const nProjects = Math.round((contact.ltv || 0) / 8000) || 1;

  const points = talkingPoints[contact.id] || getDefaultTalkingPoints(contact);
  const roles = expandRoles[contact.id] || getDefaultExpandRoles(contact);

  const scenarios = [
    'Proposal Follow-up', 'Invoice Chase', 'Re-engage', 'Post-Project',
    'Rate Increase', 'Scope Pushback', 'Thank You', 'Check-in',
  ];
  const tones = ['Friendly', 'Professional', 'Direct'];

  const activeDraftFn = ghostDrafts[ghostScenario]?.[ghostTone];
  const draftText = activeDraftFn ? activeDraftFn(contactWithFirst) : '';

  const TABS = ['Intel', 'Brief', 'Ghost', 'Expand'];

  // Handle expand role -> ghost tab navigation
  useEffect(() => {
    if (expandGhostPrefill) {
      setGhostScenario('Re-engage');
      setRadarTab('Ghost');
      setExpandGhostPrefill(null);
    }
  }, [expandGhostPrefill]);

  const copyDraft = () => {
    navigator.clipboard.writeText(draftText).catch(() => {});
    showToast('Copied!');
  };

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="slide-panel slide-panel-wide">
        <div className="slide-panel-header">
          <span className="slide-panel-title">Radar — {contact.name}</span>
          <button className="close-btn" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'flex', gap: 4, padding: '12px 24px 0',
          background: '#fff', borderBottom: '1px solid #e5e0d8',
        }}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setRadarTab(tab)}
              style={{
                padding: '7px 18px', borderRadius: '999px 999px 0 0',
                border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                background: radarTab === tab ? '#f59e0b' : 'transparent',
                color: radarTab === tab ? '#fff' : '#6b7280',
                transition: 'all 0.15s',
                marginBottom: radarTab === tab ? -1 : 0,
                borderBottom: radarTab === tab ? '2px solid #f59e0b' : 'none',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="slide-panel-body">

          {/* ── TAB 1: INTEL ── */}
          {radarTab === 'Intel' && (
            <>
              {/* Company signals */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#1a1a1a', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }} />
                  Company Signals
                </div>
                {data.company.map((sig, i) => (
                  <div key={i} style={{
                    background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10,
                    padding: '10px 14px', marginBottom: 8,
                  }}>
                    <div style={{ fontSize: 13, color: '#1e3a8a', lineHeight: 1.5 }}>{sig.text}</div>
                    <div style={{ fontSize: 11, color: '#60a5fa', marginTop: 4 }}>{sig.time}</div>
                  </div>
                ))}
              </div>

              {/* Opportunity signals */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#1a1a1a', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
                  Opportunity Signals
                </div>
                {data.opportunity.map((sig, i) => (
                  <div key={i} style={{
                    background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10,
                    padding: '10px 14px', marginBottom: 8,
                  }}>
                    <div style={{ fontSize: 13, color: '#78350f', lineHeight: 1.5 }}>{sig.text}</div>
                    <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 4 }}>{sig.time}</div>
                  </div>
                ))}
              </div>

              {/* Pay Profile */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#1a1a1a', marginBottom: 10 }}>Pay Profile</div>
                <div style={{
                  background: payBg, border: `1px solid ${payBg}`, borderRadius: 10, padding: '12px 16px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <PayScoreStars score={data.pay.score} />
                    <span style={{ fontWeight: 600, fontSize: 13, color: payColor }}>{data.pay.label}</span>
                  </div>
                  <div style={{ fontSize: 13, color: payColor }}>{data.pay.detail}</div>
                </div>
              </div>

              {/* Action suggestions */}
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#1a1a1a', marginBottom: 10 }}>Suggested Actions</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-primary btn-sm" onClick={() => setRadarTab('Ghost')}>Send a check-in email</button>
                  <button className="btn btn-secondary btn-sm">Log a note</button>
                </div>
              </div>
            </>
          )}

          {/* ── TAB 2: BRIEF ── */}
          {radarTab === 'Brief' && (
            <>
              {/* Header box */}
              <div style={{
                background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10,
                padding: 16, marginBottom: 16,
              }}>
                <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                  📋 Pre-Meeting Brief
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a1a', marginBottom: 2 }}>
                  {contact.name} · {contact.company}
                </div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>Meeting prep generated by Flint AI</div>
              </div>

              {/* Relationship snapshot */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 600, fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                  Relationship Snapshot
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ fontSize: 13, color: '#1a1a1a', lineHeight: 1.5 }}>
                    You've worked together on <strong>{contact.lastProject}</strong> · {contact.lastProjectDate}
                  </div>
                  <div style={{ fontSize: 13, color: '#1a1a1a', lineHeight: 1.5 }}>
                    Lifetime value: <strong>S${(contact.ltv || 0).toLocaleString()}</strong> across {nProjects} project{nProjects !== 1 ? 's' : ''}
                  </div>
                  <div style={{ fontSize: 13, color: '#1a1a1a', lineHeight: 1.5 }}>
                    <span style={{
                      background: '#fef3c7', color: '#92400e',
                      padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, marginRight: 6,
                    }}>{relLabel} relationship</span>
                    <span style={{
                      background: payBg, color: payColor,
                      padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                    }}>{payLabel}</span>
                  </div>
                </div>
              </div>

              {/* Recent signals */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 600, fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                  Recent Signals
                </div>
                <div style={{
                  borderLeft: '3px solid #f59e0b', background: '#fffbeb',
                  borderRadius: '0 8px 8px 0', padding: '10px 14px',
                }}>
                  <div style={{ fontSize: 13, color: '#78350f', lineHeight: 1.5, fontStyle: 'italic' }}>
                    "{data.company[0].text}"
                  </div>
                  <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 4 }}>{data.company[0].time}</div>
                </div>
              </div>

              {/* Talking points */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 600, fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                  Suggested Talking Points
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {points.map((pt, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{
                        width: 20, height: 20, borderRadius: '50%',
                        background: '#f59e0b', color: '#fff',
                        fontSize: 11, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, marginTop: 1,
                      }}>{i + 1}</span>
                      <div style={{ fontSize: 13, color: '#1a1a1a', lineHeight: 1.5 }}>{pt}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action button */}
              <button
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => showToast(`Added to your next meeting with ${contact.name}`)}
              >
                Open in Calendar
              </button>
            </>
          )}

          {/* ── TAB 3: GHOST ── */}
          {radarTab === 'Ghost' && (
            <>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontWeight: 600, fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                  Scenario
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {scenarios.map(sc => (
                    <button
                      key={sc}
                      onClick={() => setGhostScenario(sc)}
                      style={{
                        padding: '5px 12px', borderRadius: 999, border: '1px solid',
                        borderColor: ghostScenario === sc ? '#f59e0b' : '#e5e0d8',
                        background: ghostScenario === sc ? '#f59e0b' : '#fff',
                        color: ghostScenario === sc ? '#fff' : '#6b7280',
                        fontSize: 12, fontWeight: 500, cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {sc}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ fontWeight: 600, fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                  Tone
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {tones.map(tone => (
                    <button
                      key={tone}
                      onClick={() => setGhostTone(tone)}
                      style={{
                        padding: '5px 16px', borderRadius: 999, border: '1px solid',
                        borderColor: ghostTone === tone ? '#f59e0b' : '#e5e0d8',
                        background: ghostTone === tone ? '#f59e0b' : '#fff',
                        color: ghostTone === tone ? '#fff' : '#6b7280',
                        fontSize: 12, fontWeight: 500, cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              {/* Draft area */}
              <div style={{
                background: '#fff', border: '1px solid #e5e0d8', borderRadius: 10,
                padding: 16, marginBottom: 14, whiteSpace: 'pre-wrap',
                fontSize: 13, color: '#1a1a1a', lineHeight: 1.7,
                maxHeight: 280, overflowY: 'auto',
                fontFamily: 'inherit',
              }}>
                {draftText}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={copyDraft}
                >
                  📋 Copy to clipboard
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => showToast('Opening email client... (connect email in Setup)')}
                >
                  ✉️ Open in Mail
                </button>
              </div>

              <div style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.5 }}>
                Ghost learns your tone over time. Edit freely — it gets smarter.
              </div>
            </>
          )}

          {/* ── TAB 4: EXPAND ── */}
          {radarTab === 'Expand' && (
            <>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a', marginBottom: 4 }}>
                  Grow your network at {contact.company}
                </div>
                <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>
                  You know {contact.name} ({contact.jobTitle}). Here are the other contacts worth building relationships with:
                </div>
              </div>

              {roles.map((role, i) => (
                <div key={i} style={{
                  background: '#fff', border: '1px solid #e5e0d8', borderRadius: 10,
                  padding: 12, marginBottom: 8,
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 18 }}>{role.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#1a1a1a', marginBottom: 2 }}>
                        {role.role}
                      </div>
                      <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>
                        {role.rationale}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: 12 }}
                      onClick={() => showToast(`Added ${role.role} at ${contact.company} to your contacts`)}
                    >
                      Add Contact
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: 12 }}
                      onClick={() => { setGhostScenario('Re-engage'); setRadarTab('Ghost'); }}
                    >
                      Draft intro email
                    </button>
                  </div>
                </div>
              ))}

              <div style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.5, marginTop: 8 }}>
                Expand suggestions are based on company size, industry, and your current contact's seniority. Real LinkedIn data available in Premium.
              </div>
            </>
          )}

        </div>

        <div style={{ padding: '14px 24px', borderTop: '1px solid #e5e0d8' }}>
          <div style={{ fontSize: 11, color: '#9ca3af', lineHeight: 1.5 }}>
            Signals are AI-simulated. Real-time web scanning available in Premium.
          </div>
        </div>
      </div>
    </>
  );
}

export default function Contacts() {
  const [contacts, setContacts] = useState(initialContacts);
  const [showNew, setShowNew] = useState(false);
  const [editContact, setEditContact] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [openStatusDrop, setOpenStatusDrop] = useState(null);
  const [toast, setToast] = useState('');
  const [radarContact, setRadarContact] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', lastInteraction: '',
    website: '', company: '', jobTitle: '', status: 'Follow Up',
    addToProject: false, notes: '', tags: [],
  });

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const openForm = (contact = null) => {
    if (contact) {
      setEditContact(contact);
      setForm({ ...contact });
    } else {
      setEditContact(null);
      setForm({ name: '', email: '', phone: '', lastInteraction: '', website: '', company: '', jobTitle: '', status: 'Follow Up', addToProject: false, notes: '', tags: [] });
    }
    setShowNew(true);
  };

  const saveContact = () => {
    if (!form.name) return;
    if (editContact) {
      setContacts(c => c.map(ct => ct.id === editContact.id ? { ...ct, ...form } : ct));
      showToast('Contact updated!');
    } else {
      setContacts(c => [...c, { id: Date.now(), ...form, ltv: 0, relationship: 3, lastProject: '', lastProjectDate: '', archived: false }]);
      showToast('Contact added!');
    }
    setShowNew(false);
  };

  const deleteContact = (id) => {
    setContacts(c => c.filter(ct => ct.id !== id));
    setOpenMenu(null);
  };

  const archiveContact = (id) => {
    setContacts(c => c.map(ct => ct.id === id ? { ...ct, archived: true } : ct));
    setOpenMenu(null);
    showToast('Contact archived.');
  };

  const changeStatus = (id, status) => {
    setContacts(c => c.map(ct => ct.id === id ? { ...ct, status } : ct));
    showToast('Status updated!');
  };

  const changeRelationship = (id, value) => {
    setContacts(c => c.map(ct => ct.id === id ? { ...ct, relationship: value } : ct));
  };

  const visibleContacts = contacts.filter(c => showArchived ? true : !c.archived);

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Contacts</h1>
        <button className="btn btn-primary" onClick={() => openForm()}>
          <Plus size={16} /> New Contact
        </button>
      </div>

      {/* Archive toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <label className="toggle" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={showArchived} onChange={e => setShowArchived(e.target.checked)} />
          <span className="toggle-slider" />
          <span style={{ fontSize: 13, color: '#6b7280' }}>
            Show archived ({contacts.filter(c => c.archived).length})
          </span>
        </label>
      </div>

      {visibleContacts.length === 0 ? (
        <div className="table-container">
          <div className="empty-state">
            <div className="empty-state-icon"><BookUser size={48} /></div>
            <h3>No contacts yet — add your first client</h3>
            <p>Keep track of clients, leads, and collaborators in one place.</p>
            <button className="btn btn-primary" onClick={() => openForm()}>
              <Plus size={16} /> New Contact
            </button>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th>Lifetime Value</th>
                <th>Relationship</th>
                <th>Last Project</th>
                <th>Status</th>
                <th>Radar</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visibleContacts.map(c => (
                <tr key={c.id} style={{ opacity: c.archived ? 0.5 : 1 }}>
                  <td>
                    <div style={{ fontWeight: 500, color: '#1a1a1a' }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>{c.jobTitle}</div>
                  </td>
                  <td style={{ color: '#6b7280', fontWeight: 500 }}>{c.company}</td>
                  <td style={{ fontWeight: 600, color: '#1a1a1a' }}>
                    S${(c.ltv || 0).toLocaleString()}
                  </td>
                  <td>
                    <RelationshipDots
                      value={c.relationship || 1}
                      onChange={(val) => changeRelationship(c.id, val)}
                    />
                  </td>
                  <td>
                    {c.lastProject ? (
                      <div>
                        <div style={{ fontSize: 13, color: '#1a1a1a', fontWeight: 500 }}>{c.lastProject}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af' }}>{c.lastProjectDate}</div>
                      </div>
                    ) : <span style={{ color: '#9ca3af', fontSize: 13 }}>—</span>}
                  </td>
                  <td style={{ position: 'relative' }}>
                    <button
                      onClick={() => setOpenStatusDrop(openStatusDrop === c.id ? null : c.id)}
                      style={{
                        ...(statusStyle[c.status] || { background: '#f3f4f6', color: '#4b5563' }),
                        padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                        border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
                      }}
                    >
                      {c.status}
                      <span style={{ fontSize: 10, opacity: 0.6 }}>▾</span>
                    </button>
                    {openStatusDrop === c.id && (
                      <StatusDropdown
                        contactId={c.id}
                        current={c.status}
                        onChange={changeStatus}
                        onClose={() => setOpenStatusDrop(null)}
                      />
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => setRadarContact(c)}
                      style={{
                        background: '#dbeafe', color: '#1e40af', border: 'none',
                        borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Radar
                    </button>
                  </td>
                  <td style={{ position: 'relative' }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '4px 6px' }}
                      onClick={() => setOpenMenu(openMenu === c.id ? null : c.id)}
                    >
                      <MoreVertical size={15} />
                    </button>
                    {openMenu === c.id && (
                      <>
                        <div style={{ position: 'fixed', inset: 0, zIndex: 48 }} onClick={() => setOpenMenu(null)} />
                        <div className="dropdown-menu" style={{ position: 'absolute', right: 0, top: 32, zIndex: 49 }}>
                          <button className="dropdown-item" onClick={() => { openForm(c); setOpenMenu(null); }}>View / Edit</button>
                          <button className="dropdown-item" onClick={() => setOpenMenu(null)}>Add to Project</button>
                          <button className="dropdown-item" onClick={() => archiveContact(c.id)}>Archive</button>
                          <button className="dropdown-item danger" onClick={() => deleteContact(c.id)}>Delete</button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Radar Slide Panel */}
      {radarContact && (
        <RadarPanel
          contact={radarContact}
          onClose={() => setRadarContact(null)}
          showToast={showToast}
        />
      )}

      {showNew && (
        <>
          <div className="overlay" onClick={() => setShowNew(false)} />
          <div className="slide-panel">
            <div className="slide-panel-header">
              <span className="slide-panel-title">{editContact ? 'Edit Contact' : 'New Contact'}</span>
              <button className="close-btn" onClick={() => setShowNew(false)}><X size={16} /></button>
            </div>
            <div className="slide-panel-body">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+65 9123 4567" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Last Interaction</label>
                <input className="form-input" type="date" value={form.lastInteraction} onChange={e => setForm(f => ({ ...f, lastInteraction: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Website</label>
                <input className="form-input" value={form.website || ''} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://example.com" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Organisation</label>
                  <input className="form-input" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="Company name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Job Title</label>
                  <input className="form-input" value={form.jobTitle} onChange={e => setForm(f => ({ ...f, jobTitle: e.target.value }))} placeholder="e.g. Brand Manager" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  {STATUS_OPTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="toggle">
                  <input type="checkbox" checked={form.addToProject} onChange={e => setForm(f => ({ ...f, addToProject: e.target.checked }))} />
                  <span className="toggle-slider" />
                  <span style={{ fontSize: 13, color: '#6b7280' }}>Add to a project</span>
                </label>
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-textarea" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any relevant notes…" />
              </div>
            </div>
            <div className="slide-panel-footer">
              <button className="btn btn-secondary" onClick={() => setShowNew(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveContact}>
                {editContact ? 'Save Changes' : 'Add Contact'}
              </button>
            </div>
          </div>
        </>
      )}

      {toast && (
        <div className="toast">
          <CheckCircle size={16} color="#10b981" />
          {toast}
        </div>
      )}
    </div>
  );
}

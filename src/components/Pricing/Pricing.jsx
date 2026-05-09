import { useState } from 'react';
import { Check } from 'lucide-react';

const features = [
  { label: 'Invoicing & Contracts' },
  { label: 'eSignatures' },
  { label: 'Payment Processing' },
  { label: 'Built-in Scheduler' },
  { label: 'Lead Capture Forms', badge: 'Headspace', badgeBg: '#fef3c7', badgeColor: '#92400e' },
  { label: 'Basic Automation' },
  { label: 'Projects & Pipeline' },
  { label: 'Client & Contact Management' },
  { label: 'Flint Brief Daily Digest' },
  { label: 'Radar Client Intelligence', badge: 'Beta', badgeBg: '#dbeafe', badgeColor: '#1e40af' },
  { label: 'Margin Map Reports' },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="page-content">
      <div style={{ maxWidth: 480, margin: '0 auto', paddingTop: 32 }}>

        {/* Card */}
        <div style={{
          background: '#fff',
          borderRadius: 20,
          boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
          padding: 40,
          border: '2px solid #f59e0b',
        }}>
          {/* Label */}
          <div style={{
            fontSize: 12, fontWeight: 600, color: '#9ca3af',
            letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 6,
          }}>
            Simple, honest pricing
          </div>

          {/* Plan name */}
          <div style={{ fontSize: 30, fontWeight: 800, color: '#1a1a1a', marginBottom: 20 }}>Starter</div>

          {/* Toggle */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            background: '#f0ece4', borderRadius: 999, padding: '6px 16px', marginBottom: 20,
          }}>
            <button
              onClick={() => setAnnual(false)}
              style={{
                background: !annual ? '#fff' : 'transparent',
                border: 'none', borderRadius: 999, padding: '4px 14px',
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
                color: !annual ? '#1a1a1a' : '#9ca3af',
                boxShadow: !annual ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              style={{
                background: annual ? '#fff' : 'transparent',
                border: 'none', borderRadius: 999, padding: '4px 14px',
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
                color: annual ? '#1a1a1a' : '#9ca3af',
                boxShadow: annual ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              Annual
              {annual && (
                <span style={{
                  background: '#d1fae5', color: '#065f46',
                  fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 20,
                }}>
                  Save S$60/yr
                </span>
              )}
            </button>
          </div>

          {/* Price */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: 52, fontWeight: 800, color: '#1a1a1a', letterSpacing: '-2px' }}>
                S${annual ? 25 : 30}
              </span>
              <span style={{ fontSize: 16, color: '#9ca3af' }}>/month</span>
            </div>
            {annual && (
              <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 2 }}>Billed annually — S$300/year</div>
            )}
            {!annual && (
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>Or S$25/mo billed annually</div>
            )}
          </div>

          {/* CTA */}
          <button
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', fontSize: 15, padding: '13px 0', marginBottom: 10, borderRadius: 12 }}
          >
            Start 30-Day Free Trial
          </button>

          {/* Fine print */}
          <div style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginBottom: 24 }}>
            60-day money-back guarantee · No setup fees · Cancel anytime
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: '#e5e0d8', marginBottom: 24 }} />

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {features.map((feat, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                  background: '#d1fae5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Check size={12} color="#065f46" strokeWidth={2.5} />
                </div>
                <span style={{ fontSize: 14, color: '#1a1a1a', flex: 1 }}>{feat.label}</span>
                {feat.badge && (
                  <span style={{
                    background: feat.badgeBg, color: feat.badgeColor,
                    padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                  }}>
                    {feat.badge}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Below card */}
        <div style={{ textAlign: 'center', marginTop: 24, color: '#9ca3af', fontSize: 13 }}>
          Need more? Teams and agency plans coming soon.{' '}
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f59e0b', fontWeight: 500, fontSize: 13 }}
          >
            Join the waitlist →
          </button>
        </div>
      </div>
    </div>
  );
}

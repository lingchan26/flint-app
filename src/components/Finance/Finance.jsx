import { ArrowRight } from 'lucide-react';

export default function Finance({ onNavigate }) {
  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Finance</h1>
      </div>

      <div style={{
        maxWidth: 560,
        margin: '80px auto',
        textAlign: 'center',
        padding: '40px',
        background: '#fff',
        borderRadius: 16,
        border: '1px solid #e5e0d8',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: '#fef3c7',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <ArrowRight size={24} color="#f59e0b" />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', marginBottom: 10 }}>
          Financial data has moved
        </h2>
        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 8, lineHeight: 1.6 }}>
          Financial data has moved to <strong>Income → Expenses</strong> and <strong>Income → Profit & Loss</strong>.
        </p>
        <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 28 }}>
          All your invoices, expenses, and P&L reports are now in one unified Income hub.
        </p>
        {onNavigate && (
          <button
            className="btn btn-primary"
            onClick={() => onNavigate('income')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            Go to Income <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

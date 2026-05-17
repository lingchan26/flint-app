import { useState } from 'react';
import { FileText, Download, X, Save, Send } from 'lucide-react';

const templates = [
  { id: 1, name: 'Invoice Template', type: 'invoice' },
  { id: 2, name: 'Contractor Agreement', type: 'contractor' },
  { id: 3, name: 'Mutual NDA', type: 'nda' },
  { id: 4, name: 'Consulting Services Agreement', type: 'consulting' },
  { id: 5, name: 'Coaching Services — Statement of Work', type: 'coaching' },
  { id: 6, name: 'Creative Brief', type: 'brief' },
];

function InvoiceTemplate({ data, onChange }) {
  const subtotal = data.lines ? data.lines.reduce((sum, l) => sum + (Number(l.qty) || 0) * (Number(l.rate) || 0), 0) : 0;
  const gst = data.includeGST ? subtotal * 0.09 : 0;
  const total = subtotal + gst;

  const updateLine = (i, key, val) => {
    const lines = [...(data.lines || [])];
    lines[i] = { ...lines[i], [key]: val };
    onChange({ ...data, lines });
  };

  const addLine = () => {
    onChange({ ...data, lines: [...(data.lines || []), { desc: '', qty: '', rate: '' }] });
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1px', color: '#1a1a1a', marginBottom: 4 }}>INVOICE</div>
        <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 400, letterSpacing: '2px', textTransform: 'uppercase' }}>DRAFT</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#6b7280', minWidth: 80 }}>Invoice No:</span>
            <input className="form-input" value={data.invoiceNo || ''} onChange={e => onChange({ ...data, invoiceNo: e.target.value })} placeholder="#001" style={{ fontSize: 13 }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#6b7280', minWidth: 80 }}>Date:</span>
            <input className="form-input" type="date" value={data.date || ''} onChange={e => onChange({ ...data, date: e.target.value })} style={{ fontSize: 13 }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#6b7280', minWidth: 80 }}>Due Date:</span>
            <input className="form-input" type="date" value={data.dueDate || ''} onChange={e => onChange({ ...data, dueDate: e.target.value })} style={{ fontSize: 13 }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 32 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10, color: '#1a1a1a' }}>From</div>
          {[
            { key: 'fromBusiness', label: 'Business Name' },
            { key: 'fromAddress', label: 'Address', textarea: true },
            { key: 'fromEmail', label: 'Email' },
            { key: 'fromPhone', label: 'Phone' },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 8 }}>
              <label className="form-label" style={{ fontSize: 11 }}>{f.label}</label>
              {f.textarea
                ? <textarea className="form-textarea" value={data[f.key] || ''} onChange={e => onChange({ ...data, [f.key]: e.target.value })} style={{ minHeight: 52, fontSize: 13 }} />
                : <input className="form-input" value={data[f.key] || ''} onChange={e => onChange({ ...data, [f.key]: e.target.value })} style={{ fontSize: 13 }} />
              }
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10, color: '#1a1a1a' }}>To</div>
          {[
            { key: 'toName', label: 'Client Name' },
            { key: 'toCompany', label: 'Company' },
            { key: 'toAddress', label: 'Address', textarea: true },
            { key: 'toEmail', label: 'Email' },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 8 }}>
              <label className="form-label" style={{ fontSize: 11 }}>{f.label}</label>
              {f.textarea
                ? <textarea className="form-textarea" value={data[f.key] || ''} onChange={e => onChange({ ...data, [f.key]: e.target.value })} style={{ minHeight: 52, fontSize: 13 }} />
                : <input className="form-input" value={data[f.key] || ''} onChange={e => onChange({ ...data, [f.key]: e.target.value })} style={{ fontSize: 13 }} />
              }
            </div>
          ))}
        </div>
      </div>

      <div style={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>Services</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
        <thead>
          <tr style={{ background: '#faf8f4', borderBottom: '2px solid #e5e0d8' }}>
            {['Description', 'Qty', 'Rate', 'Amount'].map(h => (
              <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b7280' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(data.lines || [{ desc: '', qty: '', rate: '' }, { desc: '', qty: '', rate: '' }, { desc: '', qty: '', rate: '' }]).map((line, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #f0ece4' }}>
              <td style={{ padding: '6px 8px' }}><input className="form-input" value={line.desc || ''} onChange={e => updateLine(i, 'desc', e.target.value)} placeholder="Service description" style={{ fontSize: 13 }} /></td>
              <td style={{ padding: '6px 8px', width: 80 }}><input className="form-input" type="number" value={line.qty || ''} onChange={e => updateLine(i, 'qty', e.target.value)} placeholder="1" style={{ fontSize: 13 }} /></td>
              <td style={{ padding: '6px 8px', width: 120 }}><input className="form-input" type="number" value={line.rate || ''} onChange={e => updateLine(i, 'rate', e.target.value)} placeholder="0.00" style={{ fontSize: 13 }} /></td>
              <td style={{ padding: '6px 8px', width: 120, fontWeight: 500, fontSize: 13 }}>
                S${((Number(line.qty) || 0) * (Number(line.rate) || 0)).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={addLine} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', fontSize: 13, fontWeight: 500, padding: 0, marginBottom: 20 }}>
        + Add line item
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 24, fontSize: 13 }}>
          <span style={{ color: '#6b7280' }}>Subtotal</span>
          <span style={{ fontWeight: 500, minWidth: 100, textAlign: 'right' }}>S${subtotal.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', gap: 24, fontSize: 13, alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', cursor: 'pointer' }}>
            <input type="checkbox" checked={!!data.includeGST} onChange={e => onChange({ ...data, includeGST: e.target.checked })} />
            GST (9%)
          </label>
          <span style={{ fontWeight: 500, minWidth: 100, textAlign: 'right' }}>S${gst.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', gap: 24, fontSize: 18, fontWeight: 800, borderTop: '2px solid #1a1a1a', paddingTop: 8, marginTop: 4 }}>
          <span>Total</span>
          <span style={{ minWidth: 100, textAlign: 'right' }}>S${total.toFixed(2)}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="form-group">
          <label className="form-label">Payment Terms</label>
          <input className="form-input" value={data.paymentTerms || 'Payment due within 14 days'} onChange={e => onChange({ ...data, paymentTerms: e.target.value })} style={{ fontSize: 13 }} />
        </div>
        <div className="form-group">
          <label className="form-label">Payment Methods</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['Bank Transfer', 'PayNow', 'Stripe', 'PayPal'].map(m => (
              <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, cursor: 'pointer' }}>
                <input type="checkbox" />
                {m}
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Bank Details</label>
        <textarea className="form-textarea" value={data.bankDetails || ''} onChange={e => onChange({ ...data, bankDetails: e.target.value })} placeholder="Bank name, account number, BSB…" style={{ fontSize: 13 }} />
      </div>
      <div className="form-group">
        <label className="form-label">Notes</label>
        <textarea className="form-textarea" value={data.notes || ''} onChange={e => onChange({ ...data, notes: e.target.value })} placeholder="Any additional notes…" style={{ fontSize: 13 }} />
      </div>
    </div>
  );
}

function SimpleAgreement({ data, onChange, type }) {
  const fields = {
    contractor: [
      { key: 'providerName', label: 'Provider Name' },
      { key: 'clientName', label: 'Client Name' },
      { key: 'clientAddress', label: 'Client Address', textarea: true },
      { key: 'clientEmail', label: 'Client Email' },
      { key: 'clientPhone', label: 'Client Phone' },
      { key: 'startDate', label: 'Start Date', date: true },
      { key: 'endDate', label: 'End Date', date: true },
      { key: 'serviceDesc', label: 'Service Description', textarea: true },
      { key: 'feeAmount', label: 'Fee Amount' },
      { key: 'paymentTerms', label: 'Payment Terms' },
      { key: 'governingLaw', label: 'Governing Law' },
    ],
    nda: [
      { key: 'party1', label: 'Party 1 Name' },
      { key: 'party2', label: 'Party 2 Name' },
      { key: 'effectiveDate', label: 'Effective Date', date: true },
      { key: 'term', label: 'Term (years)' },
      { key: 'governingLaw', label: 'Governing Law' },
    ],
    consulting: [
      { key: 'consultantName', label: 'Consultant Name' },
      { key: 'clientName', label: 'Client Name' },
      { key: 'serviceDesc', label: 'Service Description', textarea: true },
      { key: 'startDate', label: 'Start Date', date: true },
      { key: 'endDate', label: 'End Date', date: true },
      { key: 'fee', label: 'Fee' },
      { key: 'paymentTerms', label: 'Payment Terms' },
    ],
    coaching: [
      { key: 'coachName', label: 'Coach Name' },
      { key: 'clientName', label: 'Client Name' },
      { key: 'programDesc', label: 'Program Description', textarea: true },
      { key: 'startDate', label: 'Start Date', date: true },
      { key: 'sessions', label: 'Number of Sessions' },
      { key: 'fee', label: 'Total Fee' },
      { key: 'paymentSchedule', label: 'Payment Schedule' },
    ],
    brief: [
      { key: 'projectName', label: 'Project Name' },
      { key: 'clientName', label: 'Client Name' },
      { key: 'objective', label: 'Project Objective', textarea: true },
      { key: 'targetAudience', label: 'Target Audience' },
      { key: 'deliverables', label: 'Deliverables', textarea: true },
      { key: 'deadline', label: 'Deadline', date: true },
      { key: 'budget', label: 'Budget' },
    ],
  };

  const typeFields = fields[type] || fields.contractor;
  const legalText = {
    contractor: 'This Contractor Agreement ("Agreement") is entered into as of the date noted above, between the Provider and the Client. The Provider agrees to deliver the services as described above. Payment is due as per the agreed terms. Either party may terminate this agreement with 14 days written notice. This Agreement is governed by the laws of the jurisdiction noted above.',
    nda: 'This Mutual Non-Disclosure Agreement ("Agreement") is made between the parties named above. Both parties agree to keep all confidential information shared during the course of their relationship strictly confidential. "Confidential Information" means any information marked as confidential or that a reasonable person would consider confidential. The obligations under this Agreement shall remain in effect for the term stated above.',
    consulting: 'This Consulting Services Agreement is entered into between the Consultant and the Client. The Consultant shall provide the services as described above. The Client shall pay the Consultant the agreed fee according to the payment terms. Either party may terminate this agreement with 30 days written notice. This agreement is governed by applicable law.',
    coaching: 'This Statement of Work is entered into between the Coach and the Client. The Coach agrees to provide the coaching sessions as described herein. The Client agrees to pay the total fee as per the payment schedule. Sessions are non-refundable once completed. This Agreement shall be construed in accordance with applicable law.',
    brief: 'This Creative Brief serves as the agreed scope of work between the parties. All deliverables and timelines are subject to change by mutual written agreement. The client agrees to provide all necessary materials and feedback within the agreed timeline.',
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {typeFields.map(f => (
          <div key={f.key} className="form-group" style={{ gridColumn: f.textarea ? '1 / -1' : undefined }}>
            <label className="form-label">{f.label}</label>
            {f.textarea
              ? <textarea className="form-textarea" value={data[f.key] || ''} onChange={e => onChange({ ...data, [f.key]: e.target.value })} style={{ fontSize: 13 }} />
              : <input className="form-input" type={f.date ? 'date' : 'text'} value={data[f.key] || ''} onChange={e => onChange({ ...data, [f.key]: e.target.value })} style={{ fontSize: 13 }} />
            }
          </div>
        ))}
      </div>
      <div style={{
        background: '#faf8f4', border: '1px solid #e5e0d8', borderRadius: 8,
        padding: 20, fontSize: 13, color: '#6b7280', lineHeight: 1.8,
      }}>
        {legalText[type] || legalText.contractor}
      </div>
    </div>
  );
}

function TemplateModal({ template, onClose }) {
  const [formData, setFormData] = useState({
    lines: [{ desc: '', qty: '', rate: '' }, { desc: '', qty: '', rate: '' }, { desc: '', qty: '', rate: '' }],
  });

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200 }} onClick={onClose} />
      <div style={{
        position: 'fixed', inset: 0, zIndex: 201,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '20px 20px',
        overflowY: 'auto',
      }}>
        <div style={{
          background: '#fff', borderRadius: 16, width: '100%', maxWidth: 800,
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          display: 'flex', flexDirection: 'column',
          margin: 'auto',
          minHeight: 'fit-content',
        }}
        onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 24px', borderBottom: '1px solid #e5e0d8',
            position: 'sticky', top: 0, background: '#fff', zIndex: 1,
            borderRadius: '16px 16px 0 0',
          }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{template.name}</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button className="btn btn-secondary btn-sm">
                <Save size={14} /> Save Draft
              </button>
              <button className="btn btn-primary btn-sm">
                <Download size={14} /> Download PDF
              </button>
              <button style={{
                background: '#1a1a1a', color: '#fff', border: 'none',
                borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
                fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <Send size={13} /> Send to Client
              </button>
              <button className="close-btn" onClick={onClose}><X size={16} /></button>
            </div>
          </div>

          {/* Document */}
          <div style={{ padding: 48 }}>
            {template.type === 'invoice'
              ? <InvoiceTemplate data={formData} onChange={setFormData} />
              : <SimpleAgreement data={formData} onChange={setFormData} type={template.type} />
            }
          </div>
        </div>
      </div>
    </>
  );
}

export default function FilesTemplates() {
  const [openTemplate, setOpenTemplate] = useState(null);

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Files & Templates</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {templates.map(t => (
          <div key={t.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: '#fef3c7', display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <FileText size={20} color="#f59e0b" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#1a1a1a', marginBottom: 3 }}>{t.name}</div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>Built-in template</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary btn-sm" onClick={() => setOpenTemplate(t)} style={{ flex: 1, justifyContent: 'center' }}>
                Open
              </button>
              <button className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                <Download size={13} /> Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {openTemplate && (
        <TemplateModal template={openTemplate} onClose={() => setOpenTemplate(null)} />
      )}
    </div>
  );
}

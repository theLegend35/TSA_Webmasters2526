import React from 'react';

const ReferencePage: React.FC = () => {
  return (
    <div className="content-wrapper" style={{ padding: '20px' }}>
      <h1 style={{ color: 'var(--text-main)' }}>Reference & Compliance</h1>
      
      <section style={refSection}>
        <h2 style={{ color: 'var(--text-main)' }}>Affirmation Statement</h2>
        <div style={affirmationBox}>
          <p style={{ color: 'var(--text-main)', margin: 0 }}>
            <strong style={{ color: 'var(--primary)' }}>Statement:</strong> The React framework was used to develop this website. We affirm that the theme, CSS, and component structure used on this framework were built entirely by the team and no pre-built templates or themes were used.
          </p>
        </div>
      </section>

      <section style={refSection}>
        <h2 style={{ color: 'var(--text-main)' }}>Required Documentation</h2>
        <ul style={{ color: 'var(--text-main)' }}>
          <li style={{ marginBottom: '10px' }}>
            <a href="/copyright-checklist.pdf" target="_blank" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
              Student Copyright Checklist (PDF)
            </a>
          </li>
          <li>
            <a href="/work-log.pdf" target="_blank" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
              Project Work Log (PDF)
            </a>
          </li>
        </ul>
      </section>

      <section style={refSection}>
        <h2 style={{ color: 'var(--text-main)' }}>Sources of Information</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={refTable}>
            <thead>
              <tr style={{ background: 'var(--bg-color)' }}>
                <th style={cell}>Source</th>
                <th style={cell}>Asset/Data Used</th>
              </tr>
            </thead>
            <tbody style={{ color: 'var(--text-main)' }}>
              <tr>
                <td style={cell}>Cypress Assistance Ministries</td>
                <td style={cell}>Resource directory details and mission statement.</td>
              </tr>
              <tr>
                <td style={cell}>Unsplash (Photographer: John Doe)</td>
                <td style={cell}>Hero section background image (Creative Commons).</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

const refSection = { marginBottom: '40px' };

const affirmationBox = { 
  padding: '20px', 
  border: '2px solid var(--primary)', 
  borderRadius: '8px', 
  background: 'var(--card-bg)',
  boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
};

const refTable = { 
  width: '100%', 
  borderCollapse: 'collapse' as const,
  background: 'var(--card-bg)',
};

const cell = { 
  border: '1px solid var(--border-color)',
  padding: '12px',
  color: 'var(--text-main)' 
};

export default ReferencePage;
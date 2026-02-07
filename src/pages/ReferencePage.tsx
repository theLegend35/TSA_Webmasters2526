import React from 'react';

const ReferencePage: React.FC = () => {
  const sources = [
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1521737711867-e3b97375f902" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1488459716781-31db52582fe9" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1580048915913-4f8f5cb481c4" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1581579186913-45ac3e6efe93" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1450133064473-71024230f91b" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1498837167922-ddd27525d352" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1548767797-d8c844163c4c" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1460317442991-0ec209397118" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1497215728101-856f4ea42174" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1542838132-92c53300491e" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1593113598332-cd288d649433" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1448630360428-65456885c650" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1505664194779-8beaceb93744" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1554224154-26032ffc0d07" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1518780664697-55e3ad937233" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1511632765486-a01980e01a18" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca" },
    { type: "Photography", source: "Towne Lake Texas", url: "https://townelaketexas.com/sites/default/files/gallery/bry6046.jpg" },
    { type: "Photography", source: "HDNUX / Chronicle", url: "https://s.hdnux.com/photos/01/23/35/65/21880172/4/1200x0.jpg" },
    { type: "Photography", source: "HDNUX / Chronicle", url: "https://s.hdnux.com/photos/01/23/41/37/21895159/4/1200x0.jpg" },
  ];

  return (
    <div className="content-wrapper" style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      
      <div className="animate-fade-up" style={{ marginBottom: '40px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
        <h1 style={{ color: 'var(--text-main)', fontSize: '2.5rem', marginBottom: '10px' }}>Reference & Compliance</h1>
        <p style={{ color: 'var(--text-muted)' }}>Documentation of sources, tools, and copyright compliance for TSA.</p>
      </div>
      
      <section className="animate-pop delay-1" style={refSection}>
        <h2 style={sectionHeader}>Affirmation Statement</h2>
        <div style={affirmationBox}>
          <p style={{ color: 'var(--text-main)', margin: 0, lineHeight: '1.6' }}>
            <strong style={{ color: '#3b82f6' }}>Statement:</strong> The React framework was used to develop this website. 
            We affirm that the theme, CSS, and component structure used on this framework were built entirely by the team 
            and no pre-built templates or themes were used. All logic for the Directory and Authentication systems was coded by the team using Firebase SDKs.
          </p>
        </div>
      </section>

      <section className="animate-pop delay-2" style={refSection}>
        <h2 style={sectionHeader}>Required Documentation</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
          
        <div style={pdfContainer}>
          <p style={pdfLabel}>Project Work Log</p>
          <iframe 
            src="/pdfs/workLog.pdf" 
            style={pdfIframe} 
            title="Work Log"
          />
          <a href="/pdfs/workLog.pdf" target="_blank" rel="noreferrer" style={docLinkSmall}>Open Full PDF</a>
        </div>

        <div style={pdfContainer}>
          <p style={pdfLabel}>Student Copyright Checklist</p>
          <iframe 
            src="/pdfs/copyright.pdf" 
            style={pdfIframe} 
            title="Copyright Checklist"
          />
          <a href="/pdfs/copyright.pdf" target="_blank" rel="noreferrer" style={docLinkSmall}>Open Full PDF</a>
        </div>
        </div>
      </section>

      <section className="animate-fade-up delay-3" style={refSection}>
        <h2 style={sectionHeader}>Sources of Information & Assets</h2>
        <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
          <table style={refTable}>
            <thead>
              <tr style={{ background: 'var(--bg-color)', borderBottom: '2px solid var(--border-color)' }}>
                <th style={headerCell}>Asset Type</th>
                <th style={headerCell}>Source</th>
                <th style={headerCell}>URL / Reference</th>
              </tr>
            </thead>
            <tbody>
              <tr style={rowStyle}>
                <td style={cell}>Data / Statistics</td>
                <td style={cell}>Cypress Assistance Ministries</td>
                <td style={cell}>Resource directory details and mission data.</td>
              </tr>
              <tr style={rowStyle}>
                <td style={cell}>Framework / Backend</td>
                <td style={cell}>React / Firebase / Netlify</td>
                <td style={cell}>Core application logic, database storage, and cloud deployment.</td>
              </tr>

              {sources.map((item, index) => (
                <tr key={index} style={rowStyle}>
                  <td style={cell}>{item.type}</td>
                  <td style={cell}>{item.source}</td>
                  <td style={cell}>
                    <a href={item.url} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                      {item.url.substring(0, 50)}...
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

const refSection = { marginBottom: '50px' };

const sectionHeader = { 
  color: 'var(--text-main)', 
  borderLeft: '5px solid #3b82f6', 
  paddingLeft: '15px', 
  marginBottom: '20px' 
};

const affirmationBox = { 
  padding: '25px', 
  border: '1px solid #3b82f6', 
  borderRadius: '12px', 
  background: 'rgba(59, 130, 246, 0.05)',
};

const pdfContainer = {
  background: 'var(--card-bg)',
  border: '1px solid var(--border-color)',
  borderRadius: '12px',
  padding: '15px',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '10px'
};

const pdfLabel = {
  color: 'var(--text-main)',
  fontWeight: 'bold',
  fontSize: '0.9rem',
  margin: '0'
};

const pdfIframe = {
  width: '100%',
  height: '450px',
  border: 'none',
  borderRadius: '6px',
  background: '#fff'
};

const docLinkSmall = {
  color: '#3b82f6',
  fontSize: '0.8rem',
  textDecoration: 'none',
  textAlign: 'right' as const
};

const refTable = { 
  width: '100%', 
  borderCollapse: 'collapse' as const,
  background: 'var(--card-bg)',
  fontSize: '0.9rem'
};

const headerCell = {
  textAlign: 'left' as const,
  padding: '15px',
  color: 'var(--text-muted)',
  fontWeight: 'bold',
  textTransform: 'uppercase' as const,
  fontSize: '0.75rem'
};

const rowStyle = { borderBottom: '1px solid var(--border-color)' };

const cell = { 
  padding: '12px 15px',
  color: 'var(--text-main)',
  verticalAlign: 'middle'
};

const linkStyle = {
  color: '#3b82f6',
  textDecoration: 'none',
  fontFamily: 'monospace'
};

export default ReferencePage;
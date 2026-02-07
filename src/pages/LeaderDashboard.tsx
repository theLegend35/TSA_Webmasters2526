import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { db } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  addDoc,
  setDoc,
  serverTimestamp 
} from 'firebase/firestore';

const LeaderDashboard: React.FC = () => {
  const { user } = useAuth();
  
  const [resSuggestions, setResSuggestions] = useState<any[]>([]);
  const [eventSuggestions, setEventSuggestions] = useState<any[]>([]);
  const [liveResources, setLiveResources] = useState<any[]>([]);
  const [liveEvents, setLiveEvents] = useState<any[]>([]);
  const [starredResources, setStarredResources] = useState<any[]>([]); 
  const [starredIds, setStarredIds] = useState<string[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'resources' | 'events'>('resources');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({ 
    name: '', category: '', location: '', eventDate: '', description: '', url: '', phone: '', imageUrl: '' 
  });

  const resourceCats = ['Food', 'Health', 'Education', 'Financial Aid', 'Housing', 'Other'];
  const eventCats = ['Recreational', 'Volunteering', 'Town Hall', 'Workshop', 'Festival', 'Other'];

  useEffect(() => {
    if (!user || user.role !== 'leader') return;

    const unsubResSub = onSnapshot(query(collection(db, "resourceSuggestions"), where("status", "==", "pending")), (s) => 
      setResSuggestions(s.docs.map(d => ({ ...d.data(), id: d.id })))
    );
    const unsubEvSub = onSnapshot(query(collection(db, "eventSuggestions"), where("status", "==", "pending")), (s) => 
      setEventSuggestions(s.docs.map(d => ({ ...d.data(), id: d.id })))
    );

    const unsubResLive = onSnapshot(collection(db, "resources"), (s) => 
      setLiveResources(s.docs.map(doc => ({ ...doc.data(), id: doc.id })))
    );
    const unsubEvLive = onSnapshot(collection(db, "events"), (s) => {
      setLiveEvents(s.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      setLoading(false);
    });

    const unsubStarred = onSnapshot(query(collection(db, "starred"), where("userId", "==", user.uid)), (s) => {
        const docs = s.docs.map(d => ({ ...d.data(), id: d.id }));
        setStarredResources(docs);
        setStarredIds(docs.map((d: any) => d.resourceId));
    });

    const unsubUsers = onSnapshot(collection(db, "users"), (s) => setTotalUsers(s.size));

    return () => { 
      unsubResLive(); unsubEvLive(); unsubResSub(); unsubEvSub(); unsubUsers(); unsubStarred();
    };
  }, [user]);

  const toggleStar = async (resource: any) => {
    if (!user) return;
    const starDocId = `${user.uid}_${resource.id}`;
    const isCurrentlyStarred = starredIds.includes(resource.id);

    try {
      if (isCurrentlyStarred) {
        await deleteDoc(doc(db, "starred", starDocId));
      } else {
        await setDoc(doc(db, "starred", starDocId), {
          ...resource,        
          userId: user.uid,
          resourceId: resource.id,
          starredAt: serverTimestamp()
        });
      }
    } catch (err) {
      console.error("Star Error:", err);
    }
  };

  const handleApprove = async (item: any, type: 'resource' | 'event') => {
    try {
      const liveColl = type === 'resource' ? "resources" : "events";
      const suggestColl = type === 'resource' ? "resourceSuggestions" : "eventSuggestions";
      const { id: suggestionId, ...dataToSave } = item;
      
      await addDoc(collection(db, liveColl), {
        ...dataToSave, 
        status: 'approved', 
        approvedBy: user?.email, 
        createdAt: serverTimestamp()
      });

      await updateDoc(doc(db, suggestColl, suggestionId), { status: 'approved' });
    } catch (err) { alert("Error approving."); }
  };

  const handleDelete = async (id: string, collName: string, name: string) => {
    if (window.confirm(`Are you sure you want to PERMANENTLY delete "${name}"?`)) {
      try {
        await deleteDoc(doc(db, collName, id));
      } catch (err) { alert("Error deleting."); }
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const coll = activeTab; 
    let finalUrl = formData.url.trim();
    if (finalUrl && !/^https?:\/\//i.test(finalUrl)) finalUrl = `https://${finalUrl}`;

    try {
      await addDoc(collection(db, coll), {
        ...formData,
        url: finalUrl || null,
        status: 'approved',
        createdAt: serverTimestamp(),
        approvedBy: user?.email
      });
      setIsModalOpen(false);
      setFormData({ name: '', category: '', location: '', eventDate: '', description: '', url: '', phone: '', imageUrl: '' });
    } catch (err) { alert("Error adding item."); }
  };

  const filteredData = (activeTab === 'resources' ? liveResources : liveEvents)
    .filter(i => 
      i.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      i.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (!user || user.role !== 'leader') return <Navigate to="/" />;

  return (
    <div className="content-wrapper" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      
      <header style={{ borderBottom: '2px solid var(--border-color)', marginBottom: '30px', paddingBottom: '10px' }}>
        <h1 style={{ color: 'var(--text-main)', margin: 0 }}>Leader Dashboard</h1>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Community Management Hub</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <div style={statBox}><h2>{resSuggestions.length + eventSuggestions.length}</h2><p>Pending</p></div>
        <div style={statBox}><h2>{liveResources.length}</h2><p>Active Resources</p></div>
        <div style={statBox}><h2>{liveEvents.length}</h2><p>Active Events</p></div>
        <div style={statBox}><h2>{totalUsers - 1}</h2><p>Residents</p></div>
      </div>

      <section style={{ marginTop: '40px' }}>
        <h2 style={sectionHeader}>Pending Approval</h2>
        <h3 style={subHeader}>Resource Suggestions ({resSuggestions.length})</h3>
        <Table data={resSuggestions} loading={loading} type="resource" isSuggestion onApprove={handleApprove} onDelete={(id: string, name: string) => handleDelete(id, "resourceSuggestions", name)} />
        
        <div style={{ marginTop: '30px' }}>
          <h3 style={subHeader}>Event Suggestions ({eventSuggestions.length})</h3>
          <Table data={eventSuggestions} loading={loading} type="event" isSuggestion onApprove={handleApprove} onDelete={(id: string, name: string) => handleDelete(id, "eventSuggestions", name)} />
        </div>
      </section>

      {starredResources.length > 0 && (
        <section style={{ marginTop: '40px', padding: '20px', background: 'rgba(250, 204, 21, 0.05)', borderRadius: '15px', border: '1px solid #facc15' }}>
          <h2 style={{ ...sectionHeader, color: '#ca8a04', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>★</span> Your Starred Resources (Featured on Homepage)
          </h2>
          <Table 
            data={starredResources.map(s => ({ ...s, id: s.resourceId }))} 
            loading={false} 
            type="resource" 
            onStar={toggleStar} 
            starredIds={starredIds}
            onDelete={(id: string, name: string) => handleDelete(`${user.uid}_${id}`, "starred", name)}
          />
        </section>
      )}


      <section style={{ marginTop: '60px', borderTop: '2px dashed var(--border-color)', paddingTop: '40px' }}>
        <div style={tabContainer}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => { setActiveTab('resources'); setSearchTerm(''); }} style={activeTab === 'resources' ? activeTabBtn : inactiveTabBtn}>Live Resources</button>
            <button onClick={() => { setActiveTab('events'); setSearchTerm(''); }} style={activeTab === 'events' ? activeTabBtn : inactiveTabBtn}>Live Events</button>
          </div>
          <button onClick={() => setIsModalOpen(true)} style={addBtn}>+ Add {activeTab === 'resources' ? 'Resource' : 'Event'}</button>
        </div>

        <input placeholder={`Search ${activeTab}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={tableSearchStyle} />

        <Table 
          data={filteredData} 
          loading={loading}
          type={activeTab === 'resources' ? 'resource' : 'event'} 
          onDelete={(id: string, name: string) => handleDelete(id, activeTab, name)} 
          onStar={toggleStar}
          starredIds={starredIds}
        />
      </section>

      {isModalOpen && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h2 style={{ marginTop: 0 }}>Add {activeTab === 'resources' ? 'Resource' : 'Event'}</h2>
            <form onSubmit={handleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={inputStyle} required />
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={inputStyle} required>
                <option value="">Select Category</option>
                {(activeTab === 'resources' ? resourceCats : eventCats).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input placeholder="Location" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} style={inputStyle} required />
              
              {/* Added Image and Phone fields to the modal */}
              <input placeholder="Phone Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={inputStyle} />
              <input placeholder="Image URL (Unsplash Link preferred)" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} style={inputStyle} />
              
              <input placeholder="Website URL" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} style={inputStyle} />
              <textarea placeholder="Description" style={{ ...inputStyle, height: '80px' }} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={cancelBtn}>Cancel</button>
                <button type="submit" style={approveBtn}>Publish Live</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const Table = ({ data, loading, type, onApprove, onDelete, isSuggestion, onStar, starredIds }: any) => (
  <div style={tableWrapper}>
    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ background: 'var(--bg-color)', color: 'var(--text-main)' }}>
          <th style={thStyle}>{type === 'event' ? 'Date' : 'Added'}</th>
          <th style={thStyle}>Information</th>
          <th style={thStyle}>Category</th>
          <th style={thStyle}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr><td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>Loading...</td></tr>
        ) : (
          data.map((item: any) => (
            <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={tdStyle}>{type === 'event' ? (item.eventDate || 'N/A') : (item.createdAt?.toDate?.().toLocaleDateString() || 'Today')}</td>
              <td style={tdStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {type === 'resource' && !isSuggestion && (
                        <button onClick={() => onStar(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem', color: starredIds.includes(item.id) ? '#facc15' : '#d1d5db' }}>
                            {starredIds.includes(item.id) ? '★' : '☆'}
                        </button>
                    )}
                    <div style={{ fontWeight: 'bold', fontSize: '1.05rem' }}>{item.name}</div>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>📍 {item.location}</div>
              </td>
              <td style={tdStyle}><span style={categoryBadge}>{item.category}</span></td>
              <td style={tdStyle}>
                {isSuggestion ? (
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button onClick={() => onApprove(item, type)} style={approveBtn}>Approve</button>
                    <button onClick={() => onDelete(item.id, item.name)} style={denyBtn}>Reject</button>
                  </div>
                ) : (
                  <button onClick={() => onDelete(item.id, item.name)} style={denyBtn}>Remove</button>
                )}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

const statBox = { background: 'var(--primary)', color: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center' as const };
const sectionHeader = { color: 'var(--text-main)', marginBottom: '15px', fontSize: '1.5rem' };
const subHeader = { color: 'var(--text-main)', fontSize: '1.1rem', marginBottom: '10px', opacity: 0.8 };
const tabContainer = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };
const activeTabBtn = { background: 'var(--primary)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold' as const, cursor: 'pointer' };
const inactiveTabBtn = { background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-color)', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' };
const tableSearchStyle = { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-main)', boxSizing: 'border-box' as const, marginBottom: '20px' };
const tableWrapper = { background: 'var(--card-bg)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)' };
const thStyle = { padding: '15px', borderBottom: '1px solid var(--border-color)', fontSize: '0.8rem', textTransform: 'uppercase' as const };
const tdStyle = { padding: '15px', color: 'var(--text-main)' };
const categoryBadge = { background: 'var(--primary)', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' as const };
const approveBtn = { background: '#10b981', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' as const };
const denyBtn = { background: '#ef4444', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' as const };
const cancelBtn = { background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border-color)', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' };
const addBtn = { background: 'var(--primary)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' as const };
const modalOverlay = { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' };
const modalContent = { background: 'var(--card-bg)', padding: '30px', borderRadius: '15px', width: '450px', maxWidth: '90%', border: '1px solid var(--border-color)' };
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', width: '100%', boxSizing: 'border-box' as const, background: 'var(--bg-color)', color: 'var(--text-main)' };

export default LeaderDashboard;
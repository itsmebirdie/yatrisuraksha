// src/components/TouristSafetyDashboard.jsx
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './tourist.css'; // optional local styles for component

// Fix default icon paths for leaflet when using CRA (only needed for Marker; safe to include)
import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-shadow.png';
L.Icon.Default.mergeOptions({
  shadowUrl: iconUrl,
});

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000';

export default function TouristSafetyDashboard() {
  const [tourists, setTourists] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/tourists`).then(r => r.json()).then(setTourists).catch(console.error);
    fetch(`${API_BASE}/api/alerts`).then(r => r.json()).then(setAlerts).catch(console.error);
  }, []);

  return (
    <div style={{ fontFamily: 'Inter, Roboto, sans-serif', padding: 16, background: '#f3f4f6', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h1 style={{ margin: 0 }}>Tourist Safety — Control Panel</h1>
          <small style={{ color: '#6b7280' }}>Prototype UI • Local demo data</small>
        </div>
        <div>
          <span style={{ marginRight: 12 }}>Alerts: <strong>{alerts.length}</strong></span>
          <select defaultValue="English">
            <option>English</option><option>Hindi</option>
          </select>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 16 }}>
        <div style={{ background: '#fff', padding: 12, borderRadius: 8 }}>
          <h3>Key Metrics</h3>
          <p>Active tourists: <strong>{tourists.length}</strong></p>
          <p>Active alerts: <strong>{alerts.length}</strong></p>
        </div>

        <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ padding: 12, borderBottom: '1px solid #e6e6e6' }}>
            <strong>Live Map / Heatmap</strong>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Showing tourist clusters</div>
          </div>

          <div style={{ height: 480 }}>
            <MapContainer center={[27.1, 94.4]} zoom={9} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {tourists.map(t => (
                <CircleMarker key={t.id} center={[t.lat, t.lng]} radius={6}>
                  <Popup>
                    <div>
                      <div style={{ fontWeight: 600 }}>{t.name}</div>
                      <div>Score: {t.score}</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>Last seen: {new Date(t.lastSeen).toLocaleString()}</div>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>

          <div style={{ display: 'flex', gap: 8, padding: 12 }}>
            <button
              onClick={() => {
                if (!selected) return alert('Select a tourist');
                fetch(`${API_BASE}/api/dispatch`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ touristId: selected.id }),
                }).then(r => r.json()).then(d => alert(d.message || 'Dispatched (mock)')).catch(console.error);
              }}
              style={{ background: '#dc2626', color: '#fff', padding: '8px 12px', borderRadius: 6, border: 'none' }}
            >
              Dispatch Nearest Unit
            </button>

            <button
              onClick={() => {
                if (!selected) return alert('Select a tourist');
                fetch(`${API_BASE}/api/efir`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ touristId: selected.id, details: 'Missing person - auto' }),
                }).then(r => r.json()).then(d => alert('E-FIR created: ' + d.efirId)).catch(console.error);
              }}
              style={{ background: '#f59e0b', color: '#111827', padding: '8px 12px', borderRadius: 6, border: 'none' }}
            >
              Generate E-FIR
            </button>

            <button style={{ background: '#fff', border: '1px solid #e5e7eb', padding: '8px 12px', borderRadius: 6 }}>Export CSV</button>
          </div>
        </div>

        <aside style={{ background: '#fff', padding: 12, borderRadius: 8 }}>
          <div>
            <h3 style={{ marginTop: 0 }}>Recent Alerts</h3>
            <ul style={{ paddingLeft: 16 }}>
              {alerts.slice().reverse().map(a => (
                <li key={a.id} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 14 }}>{a.message}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{new Date(a.time).toLocaleTimeString()}</div>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ marginTop: 12 }}>
            <h3>Tourist List</h3>
            <div style={{ maxHeight: 220, overflow: 'auto' }}>
              {tourists.map(t => (
                <div
                  key={t.id}
                  onClick={() => setSelected(t)}
                  style={{
                    padding: 8,
                    borderRadius: 6,
                    cursor: 'pointer',
                    background: selected && selected.id === t.id ? '#eef2ff' : 'transparent',
                    marginBottom: 6,
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{t.country} • Score: {t.score}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <h3 style={{ marginBottom: 8 }}>Selected Tourist</h3>
            {selected ? (
              <div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{selected.name}</div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>Country: {selected.country}</div>
                <div style={{ marginTop: 6 }}>Score: <strong>{selected.score}</strong></div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>Last seen: {new Date(selected.lastSeen).toLocaleString()}</div>

                <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                  <button style={{ background: '#2563eb', color: '#fff', padding: '6px 10px', borderRadius: 6, border: 'none' }}>Track</button>
                  <button
                    onClick={() => {
                      fetch(`${API_BASE}/api/alerts`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ touristId: selected.id, message: 'Manual flag from dashboard' }),
                      }).then(r => r.json()).then(a => setAlerts(prev => [...prev, a])).catch(console.error);
                    }}
                    style={{ background: '#ef4444', color: '#fff', padding: '6px 10px', borderRadius: 6, border: 'none' }}
                  >
                    Flag
                  </button>
                  <button style={{ background: '#fff', border: '1px solid #d1d5db', padding: '6px 10px', borderRadius: 6 }}>View Digital ID</button>
                </div>
              </div>
            ) : (
              <div style={{ color: '#6b7280' }}>Select a tourist to view details.</div>
            )}
          </div>
        </aside>
      </div>

      <footer style={{ textAlign: 'center', marginTop: 20, color: '#9ca3af' }}>
        Tourist Safety System — Prototype UI
      </footer>
    </div>
  );
}

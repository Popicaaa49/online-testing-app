import React from 'react';

export default function ActivityFeed({ items }) {
  return (
    <div>
      <h3>Flux live</h3>
      {items.length === 0 && <p>Nu exista activitate recenta.</p>}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map((item) => (
          <li key={item.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px' }}>
            <div>{item.message}</div>
            <small style={{ color: '#64748b' }}>{new Date(item.timestamp).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

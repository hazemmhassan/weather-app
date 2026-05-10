import React from 'react';

function fmtDate(str) {
  if (!str) return '—';
  // str may be "YYYY-MM-DD" or a Date object stringified
  return String(str).split('T')[0];
}

function fmtCreated(str) {
  if (!str) return '—';
  try { return new Date(str).toLocaleString(); }
  catch { return String(str); }
}

export default function WeatherTable({ searches, onEdit, onDelete }) {
  if (!searches?.length) {
    return (
      <div className="empty-state">
        <p>No saved searches yet. Search for a location above to get started.</p>
      </div>
    );
  }

  return (
    <div className="table-scroll">
      <table className="weather-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Location</th>
            <th>From</th>
            <th>To</th>
            <th>Saved</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {searches.map(s => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td className="td-location" title={s.location}>{s.location}</td>
              <td>{fmtDate(s.date_from)}</td>
              <td>{fmtDate(s.date_to)}</td>
              <td>{fmtCreated(s.created_at)}</td>
              <td className="td-actions">
                <button
                  className="btn-table btn-edit"
                  onClick={() => onEdit(s)}
                  aria-label="Edit record"
                >✏️ Edit</button>
                <button
                  className="btn-table btn-delete"
                  onClick={() => onDelete(s.id)}
                  aria-label="Delete record"
                >🗑️ Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

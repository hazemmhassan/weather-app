import React from 'react';

const formats = [
  { key: 'json',     label: 'JSON',     icon: '📄', cls: 'export-json' },
  { key: 'csv',      label: 'CSV',      icon: '📊', cls: 'export-csv'  },
  { key: 'pdf',      label: 'PDF',      icon: '📑', cls: 'export-pdf'  },
  { key: 'xml',      label: 'XML',      icon: '🏷️', cls: 'export-xml'  },
  { key: 'markdown', label: 'Markdown', icon: '📝', cls: 'export-md'   },
];

export default function ExportButtons() {
  const handleExport = (fmt) => {
    // Uses the CRA proxy — opens the download in a new tab
    window.open(`/api/export?format=${fmt}`, '_blank', 'noreferrer');
  };

  return (
    <div className="export-bar">
      <span className="export-label">Export all:</span>
      {formats.map(({ key, label, icon, cls }) => (
        <button
          key={key}
          className={`btn-export ${cls}`}
          onClick={() => handleExport(key)}
          aria-label={`Export as ${label}`}
        >
          {icon} {label}
        </button>
      ))}
    </div>
  );
}

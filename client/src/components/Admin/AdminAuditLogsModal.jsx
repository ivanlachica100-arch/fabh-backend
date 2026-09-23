import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { X, ShieldAlert, Loader2, RefreshCw, Activity, Terminal } from 'lucide-react';

export default function AdminAuditLogsModal({ isOpen, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/logs');
      setLogs(res.data.data || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadgeColor = (action) => {
    switch (action) {
      case 'LANDLORD_APPROVED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'LANDLORD_REJECTED':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'LANDLORD_APPLY':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'USER_REGISTER':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'USER_LOGIN':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-purple-100 text-purple-800 border-purple-200';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-100 rounded-xl text-slate-800">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">System Activity & Audit Logs</h3>
              <p className="text-xs text-slate-500">Trace actions, registrations, and application decisions.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchLogs}
              disabled={loading}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              title="Refresh logs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              Fetching audit records...
            </div>
          ) : logs.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
              No audit logs recorded yet.
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log._id}
                  className="p-3 rounded-xl border border-slate-200 bg-white flex items-start justify-between gap-3 text-xs shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${getActionBadgeColor(log.action)}`}>
                        {log.action.replace('_', ' ')}
                      </span>
                      <span className="font-semibold text-slate-900">{log.userEmail}</span>
                    </div>
                    <p className="text-slate-600">{log.details}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(log.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
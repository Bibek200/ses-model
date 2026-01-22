import React, { useEffect, useState } from 'react';
import { Inquiry } from '../types';
import { Search, Filter, Eye, Loader2, Download, Trash2, CheckCircle2, X, Mail, Calendar, User, AlertTriangle } from 'lucide-react';
import { db } from '../lib/api';

const AdminInquiries: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const data = await db.getInquiries();
      setInquiries(data);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const confirmDelete = async () => {
    if (deletingId) {
      await db.deleteInquiry(deletingId);
      setDeletingId(null);
      fetchInquiries();
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    await db.updateInquiryStatus(id, status);
    fetchInquiries();
    if (selectedInquiry?.id === id) {
      setSelectedInquiry(null);
    }
  };

  const filteredInquiries = inquiries.filter(
    (i) => i.name.toLowerCase().includes(filter.toLowerCase()) || i.email.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in relative">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Inquiries', value: inquiries.length, color: 'text-indigo-400' },
          { label: 'New Today', value: inquiries.filter(i => i.status === 'new').length, color: 'text-emerald-400' },
          { label: 'Conversion Rate', value: '12%', color: 'text-purple-400' },
          { label: 'Avg. Response', value: '2.4h', color: 'text-pink-400' },
        ].map((stat, i) => (
          <div key={i} className="glass-morphism p-6 rounded-[32px] border border-white/5">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-1">{stat.label}</p>
            <p className={`text-4xl font-black ${stat.color} tracking-tight`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative group max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
          <input
            type="text"
            placeholder="Search database..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/5 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-700 text-white font-medium"
          />
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-sm font-bold text-slate-300 hover:bg-white/10 transition-all active:scale-95">
            <Filter className="h-4 w-4" /> Filters
          </button>
          <button className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl text-sm font-bold text-white shadow-xl shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all active:scale-95">
            <Download className="h-4 w-4" /> Export Report
          </button>
        </div>
      </div>

      <div className="glass-morphism rounded-[32px] border border-white/5 overflow-hidden shadow-2xl">
        {loading ? (
          <div className="py-24 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse"></div>
                <Loader2 className="h-12 w-12 text-indigo-500 animate-spin relative" />
              </div>
              <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Scanning Core Data...</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Inquiry Source</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Message Content</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Timestamp</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Governance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {filteredInquiries.length > 0 ? (
                  filteredInquiries.map((inquiry) => (
                    <tr key={inquiry.id} className="hover:bg-white/[0.03] transition-colors group">
                      <td className="px-8 py-5 whitespace-nowrap overflow-hidden max-w-[200px]">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-white/5 flex items-center justify-center text-indigo-400 font-black text-lg group-hover:scale-110 transition-transform shrink-0">
                            {inquiry.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="overflow-hidden">
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-black text-white truncate">{inquiry.name}</div>
                              {inquiry.name.toLowerCase().includes('epic') && (
                                <span className="text-[8px] px-1.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-black uppercase tracking-widest shrink-0">Epic Lead</span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 font-medium truncate">{inquiry.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 max-w-[300px]">
                        <div className="text-sm text-slate-400 font-medium line-clamp-1 group-hover:line-clamp-none transition-all cursor-default break-words">
                          {inquiry.message}
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="text-xs text-slate-500 font-mono tracking-tighter">{inquiry.date}</div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${inquiry.status === 'new' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' :
                            inquiry.status === 'read' ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-700'
                            }`}></span>
                          <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${inquiry.status === 'new' ? 'text-emerald-400' :
                            inquiry.status === 'read' ? 'text-indigo-400' : 'text-slate-500'
                            }`}>
                            {inquiry.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedInquiry(inquiry)}
                            title="Examine"
                            className="p-2.5 rounded-xl border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 text-slate-500 hover:text-indigo-400 transition-all"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(inquiry.id, 'read')}
                            title="Mark Resolved"
                            className="p-2.5 rounded-xl border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/5 text-slate-500 hover:text-emerald-400 transition-all"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeletingId(inquiry.id)}
                            title="Delete"
                            className="p-2.5 rounded-xl border border-white/5 hover:border-red-500/30 hover:bg-red-500/5 text-slate-500 hover:text-red-400 transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-32 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                          <Search className="h-10 w-10 text-slate-700" />
                        </div>
                        <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">No matching records found in logs</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between glass-morphism p-6 rounded-[32px] border border-white/5">
        <p className="text-xs text-slate-500 font-medium">
          Showing <span className="text-white font-bold">1</span> to <span className="text-white font-bold">{filteredInquiries.length}</span> of <span className="text-white font-bold">{filteredInquiries.length}</span> entries
        </p>
        <div className="flex items-center gap-2">
          <button className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/5 text-xs font-bold text-slate-400 hover:bg-white/10 transition-all disabled:opacity-30" disabled>Previous</button>
          <div className="flex items-center gap-1">
            <button className="h-10 w-10 rounded-xl bg-indigo-600 text-white text-xs font-black shadow-lg shadow-indigo-500/20 transition-all">1</button>
          </div>
          <button className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/5 text-xs font-bold text-slate-400 hover:bg-white/10 transition-all disabled:opacity-30" disabled>Next</button>
        </div>
      </div>

      {/* View Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-24 bg-[#020617]/80 backdrop-blur-sm animate-fade-in text-slate-200">
          <div className="relative w-full max-w-2xl bg-[#0f172a] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden animate-slide-up">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

            <div className="p-8 sm:p-12">
              <div className="flex justify-between items-start mb-10">
                <div className="flex items-center gap-6">
                  <div className="h-16 w-16 rounded-3xl bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center text-2xl font-black text-indigo-400">
                    {selectedInquiry.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tight">{selectedInquiry.name}</h3>
                    <p className="text-slate-500 font-medium">{selectedInquiry.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-slate-400"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-10">
                <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="h-4 w-4 text-indigo-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Submission Date</span>
                  </div>
                  <p className="text-sm font-bold text-slate-200">{selectedInquiry.date}</p>
                </div>
                <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="h-4 w-4 text-purple-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Lead Status</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`h-1.5 w-1.5 rounded-full ${selectedInquiry.status === 'new' ? 'bg-emerald-500' : 'bg-indigo-500'}`}></div>
                    <p className="text-sm font-bold text-slate-200 capitalize">{selectedInquiry.status}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-12">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Inquiry Message</label>
                <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 text-slate-300 leading-relaxed font-medium min-h-[120px]">
                  {selectedInquiry.message}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => handleStatusUpdate(selectedInquiry.id, 'read')}
                  className="flex-1 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="h-5 w-5" /> Mark as Resolved
                </button>
                <button
                  onClick={() => {
                    setDeletingId(selectedInquiry.id);
                    setSelectedInquiry(null);
                  }}
                  className="p-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 transition-all"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-[#020617]/90 backdrop-blur-md animate-fade-in text-slate-200">
          <div className="relative w-full max-w-md bg-[#0f172a] border border-red-500/20 rounded-[40px] shadow-[0_0_50px_rgba(239,68,68,0.1)] overflow-hidden animate-slide-up">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-transparent"></div>

            <div className="p-10 text-center">
              <div className="h-20 w-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-8">
                <AlertTriangle className="h-10 w-10 text-red-500" />
              </div>

              <h3 className="text-2xl font-black text-white mb-4 tracking-tight">System Purge Request</h3>
              <p className="text-slate-400 font-medium mb-10 leading-relaxed px-4">
                Are you sure you want to permanently delete this inquiry? This action <span className="text-red-400 font-bold uppercase tracking-widest text-[10px] ml-1">cannot be undone</span>.
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => setDeletingId(null)}
                  className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 font-bold transition-all active:scale-95"
                >
                  Terminate Action
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all shadow-xl shadow-red-500/20 active:scale-95"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInquiries;
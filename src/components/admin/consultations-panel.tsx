"use client";

import { useState, useEffect } from "react";
import { Trash2, Mail, Phone, Calendar, CheckCircle, Clock, Building2, Briefcase } from "lucide-react";
import { getConsultations, updateConsultationStatus, deleteConsultation } from "@/app/book-consultation/actions";

export default function ConsultationsPanel() {
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const { data } = await getConsultations();
    setConsultations(data || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleUpdateStatus = async (id: string, status: "Scheduled" | "Completed" | "Cancelled") => {
    await updateConsultationStatus(id, status);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;
    await deleteConsultation(id);
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <div>
            <h2 className="font-bold text-[#0F172A] text-xl" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Consultation Bookings
            </h2>
            <p className="text-sm text-[#64748B] mt-1">Manage scheduled strategy sessions and discovery calls.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-8 text-center text-gray-500">Loading bookings...</div>
          ) : consultations.length === 0 ? (
             <div className="p-8 text-center text-gray-500">No bookings yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Schedule</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Client & Company</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Type</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider w-1/4">Project Description</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {consultations.map((booking, i) => (
                  <tr key={booking.id || i} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors items-start">
                    <td className="py-4 px-4 align-top">
                      <div className="font-bold text-[#0D9488] mb-1">{booking.date}</div>
                      <div className="flex items-center gap-1.5 text-[#64748B] text-xs">
                        <Clock size={12} /> {booking.time}
                      </div>
                      <div className="text-[10px] text-[#94A3B8] mt-1 italic">
                        Booked: {new Date(booking.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-4 align-top">
                      <div className="font-medium text-[#0F172A] mb-1">{booking.name}</div>
                      <div className="flex items-center gap-1.5 text-[#64748B] text-xs">
                        <Mail size={12} /> {booking.email}
                      </div>
                      {booking.company && (
                        <div className="flex items-center gap-1.5 text-[#64748B] text-xs mt-0.5">
                          <Building2 size={12} /> {booking.company}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 align-top">
                      <div className="inline-flex items-center px-2 py-0.5 rounded bg-[#F0FDFA] border border-[#CCFBF1] text-[#0D9488] text-[10px] font-bold uppercase tracking-wider">
                        {booking.type.replace('-', ' ')}
                      </div>
                      <div className="text-xs text-[#64748B] mt-1.5 capitalize">{booking.budget || 'Any budget'}</div>
                    </td>
                    <td className="py-4 px-4 align-top text-[#475569] text-xs leading-relaxed max-w-xs overflow-hidden text-ellipsis">
                      <div className="line-clamp-3">{booking.project_desc}</div>
                    </td>
                    <td className="py-4 px-4 align-top">
                      <select 
                        value={booking.status} 
                        onChange={(e) => handleUpdateStatus(booking.id, e.target.value as any)}
                        className={`text-xs font-semibold rounded-full px-2.5 py-1 focus:outline-none ${
                          booking.status === 'Scheduled' ? 'bg-amber-100 text-amber-700' :
                          booking.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-red-100 text-red-700'
                        }`}
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-4 px-4 align-top text-right">
                      <button onClick={() => handleDelete(booking.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-[#EF4444] transition-colors"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

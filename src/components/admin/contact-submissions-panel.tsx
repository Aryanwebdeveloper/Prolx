"use client";

import { useState, useEffect } from "react";
import { Trash2, Mail, Phone, Calendar, CheckCircle, Clock } from "lucide-react";
import { getContacts, updateContactStatus, deleteContact } from "@/app/contact-actions";

export default function ContactSubmissionsPanel() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const { data } = await getContacts();
    setContacts(data || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleUpdateStatus = async (id: string, status: "New" | "Read" | "Replied") => {
    await updateContactStatus(id, status);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this submission?")) return;
    await deleteContact(id);
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <div>
            <h2 className="font-bold text-[#0F172A] text-xl" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Contact Submissions
            </h2>
            <p className="text-sm text-[#64748B] mt-1">Review and manage inquiries from the website contact form.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-8 text-center text-gray-500">Loading submissions...</div>
          ) : contacts.length === 0 ? (
             <div className="p-8 text-center text-gray-500">No contact submissions yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Date</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Client Info</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Interest</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider w-1/3">Message</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact, i) => (
                  <tr key={contact.id || i} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors items-start">
                    <td className="py-4 px-4 align-top">
                      <div className="flex items-center gap-1.5 text-[#64748B] whitespace-nowrap">
                        <Calendar size={14} />
                        {new Date(contact.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-4 align-top">
                      <div className="font-medium text-[#0F172A] mb-1">{contact.name}</div>
                      <div className="flex items-center gap-1.5 text-[#64748B] text-xs">
                        <Mail size={12} /> {contact.email}
                      </div>
                      {contact.phone && (
                        <div className="flex items-center gap-1.5 text-[#64748B] text-xs mt-0.5">
                          <Phone size={12} /> {contact.phone}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 align-top text-[#64748B]">
                      <div className="text-[#0F172A] font-medium">{contact.service || 'N/A'}</div>
                      <div className="text-xs">{contact.budget || 'Budget unspecified'}</div>
                    </td>
                    <td className="py-4 px-4 align-top text-[#475569] text-xs leading-relaxed max-w-xs break-words">
                      {contact.message}
                    </td>
                    <td className="py-4 px-4 align-top">
                      <select 
                        value={contact.status} 
                        onChange={(e) => handleUpdateStatus(contact.id, e.target.value as any)}
                        className={`text-xs font-semibold rounded-full px-2.5 py-1 focus:outline-none ${
                          contact.status === 'New' ? 'bg-amber-100 text-amber-700' :
                          contact.status === 'Read' ? 'bg-blue-100 text-blue-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        <option value="New">New</option>
                        <option value="Read">Read</option>
                        <option value="Replied">Replied</option>
                      </select>
                    </td>
                    <td className="py-4 px-4 align-top text-right">
                      <button onClick={() => handleDelete(contact.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-[#EF4444] transition-colors"><Trash2 size={16} /></button>
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

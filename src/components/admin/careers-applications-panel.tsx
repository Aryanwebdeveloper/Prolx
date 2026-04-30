"use client";
import{useState,useEffect,useCallback}from"react";
import{Eye,CheckCircle,XCircle,Mail,ExternalLink,RefreshCw,Loader2,Search,Download,Calendar,DollarSign,Clock,FileText,X,Star,Send,Users,Phone,MapPin,MessageCircle}from"lucide-react";
import{getJobApplications,updateApplicationStatus,getCareerJobs,bulkUpdateApplicationStatus,sendEmailToApplicant,sendBulkEmail,scheduleInterview,scheduleBulkInterviews,exportApplicationsCSV}from"@/app/careers-actions";
const STATUS=["Pending","Reviewed","Shortlisted","Interview Scheduled","Rejected","Hired"];
const SC:Record<string,string>={Pending:"bg-amber-100 text-amber-700",Reviewed:"bg-blue-100 text-blue-700",Shortlisted:"bg-green-100 text-green-700","Interview Scheduled":"bg-indigo-100 text-indigo-700",Rejected:"bg-red-100 text-red-700",Hired:"bg-teal-100 text-teal-700"};
export default function CareersApplicationsPanel(){
const[apps,setApps]=useState<any[]>([]);
const[jobs,setJobs]=useState<any[]>([]);
const[loading,setLoading]=useState(true);
const[sel,setSel]=useState<any>(null);
const[filterJob,setFilterJob]=useState("");
const[filterStatus,setFilterStatus]=useState("");
const[search,setSearch]=useState("");
const[dateFrom,setDateFrom]=useState("");
const[dateTo,setDateTo]=useState("");
const[updatingId,setUpdatingId]=useState<string|null>(null);
const[selected,setSelected]=useState<string[]>([]);
const[showEmail,setShowEmail]=useState(false);
const[showInterview,setShowInterview]=useState(false);
const[emailSubject,setEmailSubject]=useState("");
const[emailBody,setEmailBody]=useState("");
const[intDate,setIntDate]=useState("");
const[intType,setIntType]=useState("In-Person");
const[intName,setIntName]=useState("");
const[intOffice,setIntOffice]=useState("Prolx Digital Agency, Office Address");
const[sending,setSending]=useState(false);
const load=useCallback(async()=>{
setLoading(true);
const[{data:a},{data:j}]=await Promise.all([
getJobApplications(filterJob||undefined,filterStatus||undefined,search||undefined,dateFrom||undefined,dateTo||undefined),
getCareerJobs()
]);
setApps(a||[]);setJobs(j||[]);setLoading(false);
},[filterJob,filterStatus,search,dateFrom,dateTo]);
useEffect(()=>{load();},[]);
const doStatus=async(id:string,status:string)=>{
setUpdatingId(id);
await updateApplicationStatus(id,status);
setApps(p=>p.map(a=>a.id===id?{...a,status}:a));
if(sel?.id===id)setSel((p:any)=>({...p,status}));
setUpdatingId(null);
};
const doBulkStatus=async(status:string)=>{
if(!selected.length)return;
await bulkUpdateApplicationStatus(selected,status);
setApps(p=>p.map(a=>selected.includes(a.id)?{...a,status}:a));
setSelected([]);
};
const doExport=async()=>{
const{csv}=await exportApplicationsCSV(filterJob||undefined,filterStatus||undefined);
if(!csv)return;
const blob=new Blob([csv],{type:"text/csv"});
const url=URL.createObjectURL(blob);
const a=document.createElement("a");a.href=url;a.download="applications.csv";a.click();
URL.revokeObjectURL(url);
};
const doSendEmail=async()=>{
if(!emailSubject||!emailBody)return;
setSending(true);
if(sel&&selected.length===0){await sendEmailToApplicant(sel.id,emailSubject,emailBody);}
else{await sendBulkEmail(selected,emailSubject,emailBody);}
setSending(false);setShowEmail(false);setEmailSubject("");setEmailBody("");
};
const doSchedule=async()=>{
if(!intDate)return;
setSending(true);
if(selected.length>0&&!sel){
  await scheduleBulkInterviews(selected,{
    scheduled_at:intDate,
    office_address:intOffice,
    interview_mode:"Physical",
    interview_type:intType,
    interviewer_name:intName
  });
  setApps(p=>p.map(a=>selected.includes(a.id)?{...a,status:"Interview Scheduled"}:a));
  setSelected([]);
}else if(sel){
  await scheduleInterview(sel.id,{
    scheduled_at:intDate,
    office_address:intOffice,
    interview_mode:"Physical",
    interview_type:intType,
    interviewer_name:intName
  });
  setApps(p=>p.map(a=>a.id===sel.id?{...a,status:"Interview Scheduled"}:a));
  setSel((p:any)=>({...p,status:"Interview Scheduled"}));
}
setSending(false);setShowInterview(false);setIntDate("");setIntName("");setIntOffice("");
};
const toggleSel=(id:string)=>setSelected(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
const toggleAll=()=>setSelected(selected.length===apps.length?[]:apps.map(a=>a.id));
const stats=[
{label:"Total",count:apps.length},
{label:"Pending",count:apps.filter(a=>a.status==="Pending").length},
{label:"Shortlisted",count:apps.filter(a=>a.status==="Shortlisted").length},
{label:"Interview",count:apps.filter(a=>a.status==="Interview Scheduled").length},
{label:"Hired",count:apps.filter(a=>a.status==="Hired").length},
{label:"Rejected",count:apps.filter(a=>a.status==="Rejected").length},
];
return(
<div className="flex gap-6">
<div className="flex-1 space-y-4 min-w-0">
<div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
<div className="flex flex-wrap items-center justify-between gap-3 mb-4">
<div>
<h2 className="font-bold text-[#0F172A] text-xl" style={{fontFamily:"'Bricolage Grotesque',sans-serif"}}>Job Applications</h2>
<p className="text-sm text-[#64748B] mt-0.5">Manage and track all applicants</p>
</div>
<div className="flex items-center gap-2 flex-wrap">
{selected.length>0&&(
<>
<button onClick={()=>doBulkStatus("Shortlisted")} className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg">Shortlist ({selected.length})</button>
<button onClick={()=>doBulkStatus("Rejected")} className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg">Reject ({selected.length})</button>
<button onClick={()=>{setShowEmail(true);setSel(null);}} className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1"><Mail size={13}/>Email ({selected.length})</button>
<button onClick={()=>{setShowInterview(true);setSel(null);}} className="px-3 py-1.5 bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold rounded-lg flex items-center gap-1"><Calendar size={13}/>Schedule ({selected.length})</button>
</>
)}
<button onClick={doExport} className="flex items-center gap-1.5 px-3 py-1.5 text-[#64748B] border border-[#E2E8F0] hover:border-[#0D9488] hover:text-[#0D9488] text-xs font-semibold rounded-lg"><Download size={13}/>Export CSV</button>
<button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold rounded-lg"><RefreshCw size={13}/>Refresh</button>
</div>
</div>
<div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
{stats.map(({label,count})=>(
<div key={label} className="bg-[#F8FAFC] rounded-xl p-3 text-center">
<p className="text-xl font-bold text-[#0F172A]">{count}</p>
<p className="text-xs text-[#64748B]">{label}</p>
</div>
))}
</div>
<div className="flex flex-wrap gap-2">
<div className="relative flex-1 min-w-40">
<Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"/>
<input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==="Enter"&&load()} placeholder="Search name, email, position..." className="w-full pl-8 pr-3 py-2 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]"/>
</div>
<select value={filterJob} onChange={e=>setFilterJob(e.target.value)} className="px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm text-[#64748B] focus:outline-none focus:border-[#0D9488]">
<option value="">All Positions</option>
{jobs.map(j=>(<option key={j.id} value={j.id}>{j.title}</option>))}
</select>
<select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm text-[#64748B] focus:outline-none focus:border-[#0D9488]">
<option value="">All Statuses</option>
{STATUS.map(s=>(<option key={s} value={s}>{s}</option>))}
</select>
<input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} className="px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]"/>
<input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} className="px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]"/>
<button onClick={load} className="px-4 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white text-sm font-semibold rounded-lg">Filter</button>
</div>
</div>
<div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
{loading?(
<div className="p-12 text-center">
<Loader2 size={32} className="animate-spin mx-auto text-[#0D9488] mb-3"/>
<p className="text-[#64748B]">Loading applications...</p>
</div>
):apps.length===0?(
<div className="p-12 text-center">
<Users size={40} className="mx-auto text-[#CBD5E1] mb-3"/>
<p className="text-[#64748B]">No applications found.</p>
</div>
):(
<div className="overflow-x-auto">
<table className="w-full text-sm">
<thead>
<tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
<th className="py-3 px-4 w-8"><input type="checkbox" checked={selected.length===apps.length&&apps.length>0} onChange={toggleAll} className="w-4 h-4 rounded border-[#E2E8F0]"/></th>
<th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Applicant</th>
<th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Position</th>
<th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Applied</th>
<th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Status</th>
<th className="text-right py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Actions</th>
</tr>
</thead>
<tbody>
{apps.map(app=>(
<tr key={app.id} onClick={()=>setSel(app)} className={"border-b border-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors cursor-pointer"+(sel?.id===app.id?" bg-[#F0FDFA]":"")}>
<td className="py-3 px-4" onClick={e=>e.stopPropagation()}>
<input type="checkbox" checked={selected.includes(app.id)} onChange={()=>toggleSel(app.id)} className="w-4 h-4 rounded border-[#E2E8F0]"/>
</td>
<td className="py-3 px-4">
<p className="font-medium text-[#0F172A]">{app.name}</p>
<p className="text-xs text-[#64748B]">{app.email}</p>
</td>
<td className="py-3 px-4 text-[#64748B]">{app.career_jobs?.title||"—"}</td>
<td className="py-3 px-4 text-[#64748B]">{new Date(app.created_at).toLocaleDateString()}</td>
<td className="py-3 px-4">
<span className={"px-2 py-1 rounded-full text-xs font-medium "+(SC[app.status]||"bg-gray-100 text-gray-700")}>{app.status}</span>
</td>
<td className="py-3 px-4 text-right" onClick={e=>e.stopPropagation()}>
<div className="flex items-center justify-end gap-1">
<button onClick={()=>setSel(app)} className="p-1.5 rounded-lg hover:bg-[#F0FDFA] text-[#0D9488]" title="View"><Eye size={15}/></button>
{app.phone&&(
<button onClick={()=>window.open(`https://wa.me/${app.phone.replace(/\D/g,'')}`,'_blank')} className="p-1.5 rounded-lg hover:bg-green-50 text-green-600" title="WhatsApp">
<MessageCircle size={15}/>
</button>
)}
{app.status!=="Shortlisted"&&app.status!=="Hired"&&(
<button onClick={()=>doStatus(app.id,"Shortlisted")} disabled={updatingId===app.id} className="p-1.5 rounded-lg hover:bg-green-50 text-green-600" title="Shortlist">
{updatingId===app.id?<Loader2 size={15} className="animate-spin"/>:<CheckCircle size={15}/>}
</button>
)}
{app.status!=="Rejected"&&app.status!=="Hired"&&(
<button onClick={()=>doStatus(app.id,"Rejected")} disabled={updatingId===app.id} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600" title="Reject">
{updatingId===app.id?<Loader2 size={15} className="animate-spin"/>:<XCircle size={15}/>}
</button>
)}
</div>
</td>
</tr>
))}
</tbody>
</table>
</div>
)}
</div>
</div>
{sel&&(
<div className="w-80 xl:w-96 shrink-0 bg-white rounded-2xl border border-[#E2E8F0] overflow-y-auto max-h-[calc(100vh-180px)] sticky top-6">
<div className="flex items-center justify-between p-5 border-b border-[#E2E8F0] bg-[#F8FAFC]">
<h3 className="font-bold text-[#0F172A]" style={{fontFamily:"'Bricolage Grotesque',sans-serif"}}>Applicant Details</h3>
<button onClick={()=>setSel(null)} className="text-[#64748B] hover:text-[#0F172A]"><X size={18}/></button>
</div>
<div className="p-5 space-y-4">
<div className="flex items-start gap-3">
<div className="w-10 h-10 rounded-full bg-[#0D9488] flex items-center justify-center text-white font-bold text-sm shrink-0">{sel.name?.charAt(0).toUpperCase()}</div>
<div><p className="font-bold text-[#0F172A]">{sel.name}</p><p className="text-xs text-[#64748B]">{sel.email}</p><p className="text-xs text-[#0D9488] mt-0.5">{sel.career_jobs?.title}</p></div>
</div>
<div>
<p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">Update Status</p>
<div className="flex flex-wrap gap-1.5">
{STATUS.map(s=>(
<button key={s} onClick={()=>doStatus(sel.id,s)} disabled={updatingId===sel.id||sel.status===s} className={"px-2.5 py-1 rounded-lg text-xs font-semibold transition-all "+(sel.status===s?"bg-[#0D9488] text-white":"bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]")}>{s}</button>
))}
</div>
</div>
<div className="flex gap-2">
<button onClick={()=>setShowInterview(true)} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1"><Calendar size={13}/>Schedule Interview</button>
<button onClick={()=>{setShowEmail(true);setSelected([]);}} className="flex-1 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1"><Send size={13}/>Send Email</button>
</div>
<div className="space-y-2.5 border-t border-[#E2E8F0] pt-4">
{sel.phone&&(<div className="flex items-center gap-2 text-sm"><Phone size={14} className="text-[#0D9488] shrink-0"/><span className="text-[#64748B]">{sel.phone}</span></div>)}
{sel.location&&(<div className="flex items-center gap-2 text-sm"><MapPin size={14} className="text-[#0D9488] shrink-0"/><span className="text-[#64748B]">{sel.location}</span></div>)}
{sel.experience&&(<div className="flex items-center gap-2 text-sm"><Star size={14} className="text-[#0D9488] shrink-0"/><span className="text-[#64748B]">{sel.experience}</span></div>)}
{sel.expected_salary&&(<div className="flex items-center gap-2 text-sm"><DollarSign size={14} className="text-[#0D9488] shrink-0"/><span className="text-[#64748B]">{sel.expected_salary}</span></div>)}
{sel.notice_period&&(<div className="flex items-center gap-2 text-sm"><Clock size={14} className="text-[#0D9488] shrink-0"/><span className="text-[#64748B]">{sel.notice_period}</span></div>)}
{sel.portfolio_url&&(<a href={sel.portfolio_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[#0D9488] hover:underline"><ExternalLink size={14} className="shrink-0"/>Portfolio / LinkedIn</a>)}
{sel.resume_url&&(<a href={sel.resume_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[#0D9488] hover:underline"><FileText size={14} className="shrink-0"/>View Resume / CV</a>)}
</div>
{sel.message&&(
<div className="border-t border-[#E2E8F0] pt-4">
<p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">Cover Letter</p>
<p className="text-sm text-[#64748B] whitespace-pre-wrap leading-relaxed">{sel.message}</p>
</div>
)}
</div>
</div>
)}
{showEmail&&(
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
<div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
<div className="flex items-center justify-between p-5 border-b border-[#E2E8F0]">
<h3 className="font-bold text-[#0F172A]">Send Email</h3>
<button onClick={()=>setShowEmail(false)} className="text-[#64748B] hover:text-[#0F172A]"><X size={18}/></button>
</div>
<div className="p-5 space-y-4">
<p className="text-xs text-[#64748B] bg-[#F8FAFC] px-3 py-2 rounded-lg">To: {selected.length>0?`${selected.length} selected applicants`:sel?.name}</p>
<div><label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Subject</label><input value={emailSubject} onChange={e=>setEmailSubject(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]" placeholder="Email subject..."/></div>
<div><label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Message</label><textarea rows={6} value={emailBody} onChange={e=>setEmailBody(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488] resize-none" placeholder="Write your message..."/></div>
<div className="flex gap-3">
<button onClick={doSendEmail} disabled={sending||!emailSubject||!emailBody} className="flex-1 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] disabled:bg-[#94A3B8] text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2">
{sending?<Loader2 size={16} className="animate-spin"/>:<Send size={16}/>}{sending?"Sending...":"Send Email"}
</button>
<button onClick={()=>setShowEmail(false)} className="px-4 py-2.5 text-[#64748B] text-sm font-medium">Cancel</button>
</div>
</div>
</div>
</div>
)}
{showInterview&&(sel||selected.length>0)&&(
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
<div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
<div className="flex items-center justify-between p-5 border-b border-[#E2E8F0]">
<h3 className="font-bold text-[#0F172A]">Schedule Interview</h3>
<button onClick={()=>setShowInterview(false)} className="text-[#64748B] hover:text-[#0F172A]"><X size={18}/></button>
</div>
<div className="p-5 space-y-4">
<p className="text-sm text-[#64748B]">For: <strong className="text-[#0F172A]">{selected.length>0&&!sel?`${selected.length} selected applicants`:sel?.name}</strong> {sel?.career_jobs?.title?`— ${sel.career_jobs.title}`:""}</p>
<div><label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Date and Time *</label><input type="datetime-local" value={intDate} onChange={e=>setIntDate(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]"/></div>
<div><label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Interview Type</label>
<select value={intType} onChange={e=>setIntType(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]">
<option value="In-Person">In-Person</option>
<option value="Technical Test">Technical Test</option>
</select></div>
<div><label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Office Address</label><input value={intOffice} onChange={e=>setIntOffice(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]" placeholder="e.g. 123 Prolx Street, City"/></div>
<div><label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Interviewer Name</label><input value={intName} onChange={e=>setIntName(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]" placeholder="e.g. Sara Malik"/></div>
<div className="flex gap-3">
<button onClick={doSchedule} disabled={sending||!intDate} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-[#94A3B8] text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2">
{sending?<Loader2 size={16} className="animate-spin"/>:<Calendar size={16}/>}{sending?"Scheduling...":"Schedule and Notify"}
</button>
<button onClick={()=>setShowInterview(false)} className="px-4 py-2.5 text-[#64748B] text-sm font-medium">Cancel</button>
</div>
</div>
</div>
</div>
)}
</div>
);
}

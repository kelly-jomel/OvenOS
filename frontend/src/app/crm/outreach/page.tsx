"use client";
import { useState, useRef, useEffect } from 'react';
import { useBakery } from "@/context/BakeryContext";
import * as XLSX from 'xlsx';
import { Upload, Search, Mail, ExternalLink, Filter, MessageCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, writeBatch, doc, getDocs, query, where, updateDoc } from 'firebase/firestore';

export default function OutreachEngine() {
  const { profile } = useBakery();
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [search, setSearch] = useState("");
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isBatchSending, setIsBatchSending] = useState(false);
  const [batchProgress, setBatchProgress] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPendingLeads();
  }, []);

  const fetchPendingLeads = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, "outreach_leads"), where("contacted", "==", false));
      const snap = await getDocs(q);
      const leads: any[] = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      setData(leads);
      setFilteredData(leads);

      const cats = Array.from(new Set(leads.map(r => r["Primary Category"] || "Unknown"))).sort() as string[];
      const stats = Array.from(new Set(leads.map(r => r["Missing Web Status"] || "Unknown"))).sort() as string[];
      setCategories(cats);
      setStatuses(stats);
    } catch (error) {
      console.error("Error fetching outreach leads:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const cleanText = (text: any) => {
    if (typeof text !== 'string') return "";
    let cleaned = text;
    const acronyms: Record<string, string> = { " midc ": " MIDC ", " oem ": " OEM ", " google ": " Google ", " indiamart ": " IndiaMART ", " iso ": " ISO ", " cad ": " CAD ", " rfq ": " RFQ ", " cnc ": " CNC ", " vmc ": " VMC ", " gbp ": " GBP " };
    for (const [old, newStr] of Object.entries(acronyms)) { cleaned = cleaned.replace(new RegExp(old, 'gi'), newStr); }
    return cleaned.replace(/dominates local search/gi, "dominate local search");
  };

  const processRow = (row: any) => {
    const company = (row["Business Name"] || "").toString().trim();
    const category = (row["Primary Category"] || "").toString().trim();
    const subcat = (row["Sub-Category"] || "").toString().trim();
    const webStatus = (row["Missing Web Status"] || "").toString().trim();
    const hub = (row["Industrial Hub / Zone"] || "").toString().trim();
    const emailAddr = (row["Email Address"] || "").toString().trim();
    const phone = (row["Phone Number"] || "").toString().trim();
    let pitch = cleanText((row["Primary Outreach Pitch Angle"] || "").toString().trim());
    const solution = cleanText((row["Recommended Web Solution"] || "").toString().trim());

    if (pitch && !pitch.endsWith(".")) pitch += ".";
    const pitchLower = pitch ? pitch.charAt(0).toLowerCase() + pitch.slice(1) : "";

    let hook = "";
    if (webStatus.includes("Inactive") || webStatus.includes("Expired")) { hook = `I noticed that ${company}'s primary domain appears inactive, meaning potential B2B buyers searching for ${subcat.toLowerCase()} in ${hub} are landing on broken links.`; } 
    else if (webStatus.includes("WhatsApp")) { hook = `While reviewing high-capacity ${subcat.toLowerCase()} suppliers in ${hub}, I saw ${company} relies primarily on a WhatsApp Business catalog, limiting organic search visibility with corporate buyers.`; } 
    else if (webStatus.includes("Facebook")) { hook = `I noticed ${company} currently relies on a Facebook page, making it difficult for enterprise clients seeking ${subcat.toLowerCase()} in ${hub} to review technical specifications or submit RFQs directly.`; } 
    else if (webStatus.includes("IndiaMART")) { hook = `I noticed ${company} relies mostly on IndiaMART listings, where high marketplace fees and aggressive competitor ads siphon off qualified buyer inquiries.`; } 
    else if (webStatus.includes("Unlinked Directory")) { hook = `I noticed ${company} is currently listed across unlinked local directories in ${hub} without an official web portal to convert visitors into direct clients.`; } 
    else { hook = `While researching top-tier ${category.toLowerCase()} firms around ${hub}, I noticed ${company} currently operates without an optimized standalone web presence.`; }

    let subject = "";
    if (webStatus.includes("Inactive")) { subject = `Fixing ${company}'s digital presence for MIDC contracts`; } 
    else if (webStatus.includes("WhatsApp") || webStatus.includes("Facebook")) { subject = `Upgrading ${company}'s catalog into a direct lead engine`; } 
    else if (webStatus.includes("IndiaMART")) { subject = `Direct B2B inquiries for ${company} (without marketplace fees)`; } 
    else { subject = `High-converting web portal for ${company} | Xydris`; }

    const body = `Hi ${company} Team,\n\n${hook}\n\nProcurement managers today expect instant, frictionless access to technical specs and supplier capabilities. When that process is difficult, qualified RFQs inevitably drop off.\n\nAt Xydris (xydris.in), we specialize in building high-performance web portals specifically for industrial and manufacturing leaders. Implementing a custom ${solution} will allow you to ${pitchLower}\n\nThe result? You own your digital presence, capture direct B2B inquiries, and stop losing margin to third-party marketplace fees.\n\nWould you be open to a brief 10-minute chat this Thursday to see how this could impact your inbound pipeline? Alternatively, feel free to pick a time that works for you here: https://calendar.app.google/M1E76p4bSBY3ZsJQ9\n\nBest regards,\nSales Team | Xydris\nxydris.in`;

    const encodedTo = encodeURIComponent(emailAddr);
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);

    const outlookWeb = `https://outlook.office.com/mail/deeplink/compose?to=${encodedTo}&subject=${encodedSubject}&body=${encodedBody}`;
    const mailto = `mailto:${encodedTo}?subject=${encodedSubject}&body=${encodedBody}`;
    
    const cleanPhone = phone.replace(/[^\d]/g, '');
    const whatsappLink = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodedBody}` : '#';

    return { ...row, hook, subject, body, outlookWeb, mailto, whatsappLink, contacted: false };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    setUploadProgress("Parsing Excel file...");

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const jsonData: any[] = XLSX.utils.sheet_to_json(ws);
        
        const processed = jsonData.map(processRow);
        
        // Chunk array into batches of 400 (Firestore limit is 500)
        const chunkSize = 400;
        const chunks = [];
        for (let i = 0; i < processed.length; i += chunkSize) {
          chunks.push(processed.slice(i, i + chunkSize));
        }

        const outreachRef = collection(db, "outreach_leads");

        for (let i = 0; i < chunks.length; i++) {
          setUploadProgress(`Saving to database: Batch ${i + 1} of ${chunks.length}...`);
          const batch = writeBatch(db);
          
          chunks[i].forEach((lead) => {
            const newDocRef = doc(outreachRef);
            batch.set(newDocRef, { ...lead, uploadedAt: serverTimestamp() });
          });
          
          await batch.commit();
        }

        setUploadProgress("Upload complete!");
        setTimeout(() => {
          setIsUploading(false);
          fetchPendingLeads();
        }, 1500);

      } catch (error) {
        console.error("Upload failed", error);
        setIsUploading(false);
        alert("Upload failed. Check console.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const logOutreachToCRM = async (row: any, url: string, type = 'Email') => {
    if (type === 'SendGrid') {
      try {
        const res = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'marketing',
            to: row["Email Address"],
            subject: row.subject,
            html: row.body.replace(/\n/g, '<br/>')
          })
        });
        if (!res.ok) throw new Error("Failed to send via SendGrid");
        
        // Log to CRM below
        type = 'Email';
        url = ''; // Don't open window
      } catch (e) {
        console.error(e);
        return alert("Failed to send email via SendGrid. Check API keys.");
      }
    }
    try {
      const leadData = {
        name: "Unknown Contact", 
        company: row["Business Name"] || "Unknown Company",
        email: row["Email Address"] || "",
        phone: row["Phone Number"] || "",
        source: "Outreach Engine",
        status: "Contacted", outreachData: row
      };
      const leadDoc = await addDoc(collection(db, "leads"), { bakery_id: profile?.id, ...leadData, createdAt: serverTimestamp() });

      const activityData = {
        title: `Cold ${type} sent to ${leadData.company}`,
        type: type,
        status: 'Completed',
        date: new Date().toISOString().split('T')[0],
        leadId: leadDoc.id
      };
      await addDoc(collection(db, "activities"), { bakery_id: profile?.id, ...activityData, createdAt: serverTimestamp() });
      
      // Update the outreach lead as contacted so it disappears from the pending list
      if (row.id) {
        await updateDoc(doc(db, "outreach_leads", row.id), { contacted: true });
        // Optimistically remove it from UI
        const newData = data.filter(d => d.id !== row.id);
        setData(newData);
        applyFiltersState(newData, selectedCategory, selectedStatus, search);
      }
      
      if (url) window.open(url, '_blank');
      
    } catch (error) {
      console.error("Failed to log to CRM", error);
    }
  };

  
  const handleBatchSend = async (count: number) => {
    if (!confirm(`Are you sure you want to instantly send ${count} emails via SendGrid?`)) return;
    setIsBatchSending(true);
    setBatchProgress(`Preparing to send ${count} emails...`);
    
    const leadsToSend = filteredData.slice(0, count);
    let successCount = 0;
    
    for (let i = 0; i < leadsToSend.length; i++) {
        const row = leadsToSend[i];
        setBatchProgress(`Sending ${i + 1} of ${count} (To: ${row["Business Name"]})...`);
        try {
            const res = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'marketing',
                    to: row["Email Address"],
                    subject: row.subject,
                    html: row.body.replace(/\n/g, '<br/>')
                })
            });
            
            if (!res.ok) {
                console.error("Failed to send via SendGrid for", row["Email Address"]);
                continue; // Skip CRM logging if email failed
            }
            
            // Log to CRM
            const leadData = {
                name: "Unknown Contact", 
                company: row["Business Name"] || "Unknown Company",
                email: row["Email Address"] || "",
                phone: row["Phone Number"] || "",
                source: "Outreach Engine",
                status: "Contacted",
                outreachData: row
            };
            const leadDoc = await addDoc(collection(db, "leads"), { bakery_id: profile?.id, ...leadData, createdAt: serverTimestamp() });

            await addDoc(collection(db, "activities"), { bakery_id: profile?.id,
                title: `Cold SendGrid sent to ${leadData.company}`,
                type: 'SendGrid',
                status: 'Completed',
                date: new Date().toISOString().split('T')[0],
                leadId: leadDoc.id,
                createdAt: serverTimestamp()
            });
            
            if (row.id) {
                await updateDoc(doc(db, "outreach_leads", row.id), { contacted: true });
            }
            successCount++;
        } catch (e) {
            console.error("Batch send error on row", row, e);
        }
    }
    
    setIsBatchSending(false);
    alert(`Successfully sent ${successCount} out of ${count} emails!`);
    fetchPendingLeads();
  };

  const applyFilters = (cat: string, stat: string, term: string) => {
    applyFiltersState(data, cat, stat, term);
  };

  const applyFiltersState = (sourceData: any[], cat: string, stat: string, term: string) => {
    let result = sourceData;
    if (cat !== "All") result = result.filter(r => (r["Primary Category"] || "Unknown") === cat);
    if (stat !== "All") result = result.filter(r => (r["Missing Web Status"] || "Unknown") === stat);
    if (term) result = result.filter(r => ((r["Business Name"] || "") as string).toLowerCase().includes(term.toLowerCase()));
    setFilteredData(result);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">B2B Lead Outreach</h1>
          <p className="text-slate-500 text-sm mt-1">Upload your spreadsheet to permanently store and process your campaign.</p>
        </div>
        <div className="flex gap-3">
           <input type="file" accept=".xlsx, .xls" ref={fileInputRef} className="hidden" onChange={handleFileUpload} disabled={isUploading} />
           
           
           <select 
             className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-2 rounded-lg font-medium outline-none cursor-pointer hover:bg-indigo-100 transition-colors disabled:opacity-50"
             disabled={isUploading || isBatchSending || filteredData.length === 0}
             value=""
             onChange={(e) => {
               if (e.target.value) {
                 handleBatchSend(Number(e.target.value));
                 e.target.value = ""; // reset
               }
             }}
           >
             <option value="" disabled>Batch Send...</option>
             <option value="10">Send 10 Emails</option>
             <option value="20">Send 20 Emails</option>
             <option value="30">Send 30 Emails</option>
             <option value="40">Send 40 Emails</option>
             <option value="50">Send 50 Emails</option>
           </select>

           <button onClick={() => fetchPendingLeads()} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors" disabled={isUploading || isBatchSending}>
             Refresh
           </button>

           <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50">
             {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />} 
             {isUploading ? 'Processing...' : 'Upload Leads (.xlsx)'}
           </button>
        </div>
      </div>

      {isUploading && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-xl flex items-center gap-3 shadow-sm">
          <Loader2 className="animate-spin" size={20} />
          <span className="font-medium">{uploadProgress}</span>
        </div>
      )}
      
      {isBatchSending && (
        <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 p-4 rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
             <Loader2 className="animate-spin" size={20} />
             <span className="font-medium">{batchProgress}</span>
          </div>
          <span className="text-sm font-bold animate-pulse">DO NOT CLOSE TAB</span>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-20 text-slate-500 flex flex-col items-center gap-3">
           <Loader2 className="animate-spin text-blue-500" size={32} />
           <p>Loading active campaign leads...</p>
        </div>
      ) : data.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 sticky top-6">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4"><Filter size={18}/> Filters</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Search Business</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="text" className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="Search..." value={search} onChange={(e) => { setSearch(e.target.value); applyFilters(selectedCategory, selectedStatus, e.target.value); }} />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Primary Category</label>
                  <select className="w-full border border-slate-200 rounded-lg p-2 text-sm bg-white" value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); applyFilters(e.target.value, selectedStatus, search); }}>
                    <option value="All">All Categories</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Web Status</label>
                  <select className="w-full border border-slate-200 rounded-lg p-2 text-sm bg-white" value={selectedStatus} onChange={(e) => { setSelectedStatus(e.target.value); applyFilters(selectedCategory, e.target.value, search); }}>
                    <option value="All">All Statuses</option>
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-sm text-slate-600">Showing <span className="font-bold text-blue-600">{filteredData.length}</span> of {data.length} leads</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            {filteredData.map((row, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div>
                    <h2 className="font-bold text-slate-900 text-lg">{row["Business Name"] || "Unknown Business"}</h2>
                    <p className="text-sm text-slate-500">{row["Primary Category"]} • {row["Industrial Hub / Zone"]}</p>
                  </div>
                  <div className="flex gap-2">
                    {row["Google Link"] && <a href={row["Google Link"]} target="_blank" rel="noreferrer" className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-full hover:bg-slate-50 flex items-center gap-1"><ExternalLink size={12}/> Google</a>}
                    {row["IndiaMART Link"] && <a href={row["IndiaMART Link"]} target="_blank" rel="noreferrer" className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-full hover:bg-slate-50 flex items-center gap-1"><ExternalLink size={12}/> IndiaMART</a>}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
                    <div><span className="block text-slate-500 text-xs">Email</span><span className="font-medium text-slate-800">{row["Email Address"] || "N/A"}</span></div>
                    <div><span className="block text-slate-500 text-xs">Phone</span><span className="font-medium text-slate-800">{row["Phone Number"] || "N/A"}</span></div>
                    <div><span className="block text-slate-500 text-xs">Status</span><span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">{row["Missing Web Status"] || "N/A"}</span></div>
                    <div><span className="block text-slate-500 text-xs">Revenue</span><span className="font-medium text-slate-800">{row["Est. Revenue Tier"] || "N/A"}</span></div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Subject Line</label>
                      <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-slate-800 font-medium">
                        {row.subject}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email Body</label>
                      <textarea readOnly className="w-full h-48 bg-slate-50 border border-slate-200 p-4 rounded-lg text-slate-700 font-sans text-sm resize-none focus:outline-none" value={row.body}></textarea>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex flex-col sm:flex-row gap-3 border-t border-slate-100 pt-6">
                    <button onClick={() => logOutreachToCRM(row, '', 'SendGrid')} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors">
                      <Mail size={18} /> Send instantly via SendGrid
                    </button>
                    
                  </div>
                </div>
              </div>
            ))}
            
            {filteredData.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                No leads match your search criteria.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center flex flex-col items-center justify-center">
          <CheckCircle2 size={48} className="text-emerald-500 mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Inbox Zero!</h2>
          <p className="text-slate-500 mb-6 max-w-md">There are no pending outreach leads in the database. Upload a new batch to start your next campaign.</p>
          <button onClick={() => fileInputRef.current?.click()} className="text-blue-600 font-medium hover:underline">Upload New Leads</button>
        </div>
      )}
    </div>
  );
}

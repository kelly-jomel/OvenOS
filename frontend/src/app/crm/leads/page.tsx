"use client";
import { useState, useEffect } from 'react';
import SideNav from '@/components/SideNav';
import { useBakery } from "@/context/BakeryContext";
import { Plus, Search, Filter, MoreVertical, Building2, Mail, Phone, X, Save, MessageCircle, FileText, Lightbulb, ExternalLink } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp, updateDoc, doc , query, where} from 'firebase/firestore';

export default function LeadsPage() {
  const { profile } = useBakery();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  
  // Form State
  const [formData, setFormData] = useState({ name: '', company: '', email: '', phone: '', source: 'Website', status: 'Untouched', address: '', googleLink: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  async function fetchLeads() {
    try {
      const snap = await getDocs(query(collection(db, "leads"), where("bakery_id", "==", profile?.id)));
      const leadsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLeads(leadsData);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  };

  
  const openEditModal = (lead: any) => {
    setFormData({
      name: lead.name || '',
      company: lead.company || '',
      email: lead.email || '',
      phone: lead.phone || '',
      source: lead.source || 'Website',
      status: lead.status || 'Untouched',
      address: lead.address || lead.outreachData?.["Full Address"] || lead.outreachData?.["Address"] || '',
      googleLink: lead.googleLink || lead.outreachData?.["Google Link"] || ''
    });
    setEditingLeadId(lead.id);
    setIsModalOpen(true);
  };

  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingLeadId) {
        await updateDoc(doc(db, "leads", editingLeadId), formData);
      } else {
        await addDoc(collection(db, "leads"), { bakery_id: profile?.id,
          ...formData,
          createdAt: serverTimestamp()
        });
      }
      setIsModalOpen(false);
      setEditingLeadId(null);
      setFormData({ name: '', company: '', email: '', phone: '', source: 'Website', status: 'Untouched', address: '', googleLink: '' });
      fetchLeads(); // Refresh list
    } catch (error) {
      console.error("Error saving lead:", error);
    } finally {
      setIsSubmitting(false);
    }
  };


  
  const currentLead = leads.find(l => l.id === editingLeadId);

  const generateProjectReport = () => {
    if (!currentLead || !currentLead.outreachData) return;
    const data = currentLead.outreachData;
    
    
    const reportHTML = `
      <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 850px; margin: 0 auto; color: #334155; line-height: 1.7; padding: 20px;">
        
        <!-- Header -->
        <div style="text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 30px; margin-bottom: 40px;">
          <div style="text-transform: uppercase; letter-spacing: 2px; color: #64748b; font-size: 12px; font-weight: 700; margin-bottom: 15px;">Strategic Digital Transformation Proposal</div>
          <h1 style="color: #0f172a; margin: 0 0 10px 0; font-size: 36px; font-weight: 800; letter-spacing: -0.5px;">The Architecture of Engagement</h1>
          <h2 style="color: #2563eb; font-weight: 600; font-size: 22px; margin: 0 0 20px 0;">Prepared specifically for ${data['Business Name']}</h2>
          <div style="display: inline-block; background: #f1f5f9; padding: 8px 16px; border-radius: 6px; color: #475569; font-size: 14px; font-weight: 500;">
            Prepared by Xydris (xydris.in) | Pre-Sales Engineering
          </div>
        </div>

        <!-- Section 1: The Pitch -->
        <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 25px 30px; border-radius: 0 8px 8px 0; margin-bottom: 40px;">
          <h3 style="color: #1e3a8a; margin: 0 0 12px 0; font-size: 18px; text-transform: uppercase; letter-spacing: 1px;">1. Strategic Product Pitch</h3>
          <p style="margin: 0 0 15px 0; font-size: 16px; color: #1e40af; font-weight: 500;">
            ${data['Primary Category']} leaders shouldn't lose high-value B2B inquiries because their digital catalog limits their credibility. 
          </p>
          <p style="margin: 0; color: #1e3a8a;">
            At Xydris, we bridge the gap between your technical operational excellence and your digital sales infrastructure. By upgrading your ${data['Missing Web Status']?.toLowerCase()} to a custom-engineered ${data['Recommended Web Solution']?.toLowerCase()}, we transform your firm's online presence from a passive brochure into an active Lead Acquisition Engine—allowing you to confidently ${data['Primary Outreach Pitch Angle']?.toLowerCase()}.
          </p>
        </div>

        <!-- Section 2: Executive Summary -->
        <h3 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin: 0 0 20px 0; font-size: 20px;">2. Executive Summary: The Current Gap</h3>
        <p style="margin-bottom: 35px;">
          Currently, <strong>${data['Business Name']}</strong> is experiencing friction in capturing enterprise-grade B2B inquiries. The root cause is that you are currently <em>${data['Missing Web Status']?.toLowerCase()}</em>. In the highly competitive ${data['Primary Category']} sector, procurement managers and operational decision-makers expect frictionless, instant access to technical specifications and supplier capabilities. Relying on inefficient, manual, or fragmented communication channels creates a bottleneck that limits organic visibility and forces qualified commercial leads into competitor pipelines.
        </p>

        <!-- Section 3: The Solution -->
        <h3 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin: 0 0 20px 0; font-size: 20px;">3. The Xydris Solution</h3>
        <p style="margin-bottom: 15px;">
          <strong>Proposed Architecture:</strong> ${data['Recommended Web Solution']}
        </p>
        <p style="margin-bottom: 35px;">
          We propose engineering a dedicated Lead Acquisition Engine. By transitioning away from manual sales processes, we will establish an authoritative, premium digital presence designed specifically to capture, educate, and convert traffic into qualified RFQs without requiring constant human intervention. This is not just web design; this is scalable sales infrastructure.
        </p>

        <!-- Section 4: Anticipated Business Impact (ROI) -->
        <h3 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin: 0 0 20px 0; font-size: 20px;">4. Anticipated Business Impact</h3>
        <ul style="margin-bottom: 40px; padding-left: 25px;">
          <li style="margin-bottom: 12px;"><strong>Frictionless Lead Capture:</strong> Seamless transition from anonymous industry visitor to a qualified RFQ submitted directly into your pipeline.</li>
          <li style="margin-bottom: 12px;"><strong>Operational Efficiency:</strong> Significant reduction in manual inquiry sorting, redundant phone calls, and back-and-forth communication for basic capability requests.</li>
          <li style="margin-bottom: 12px;"><strong>Market Authority & Trust:</strong> A professional, institutional-grade brand presence that immediately commands trust from enterprise decision-makers comparing vendors.</li>
        </ul>

        <!-- Section 5: Strategic Approach & Scope -->
        <h3 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin: 0 0 20px 0; font-size: 20px;">5. Strategic Approach & Roadmap</h3>
        <p style="margin-bottom: 15px;">Our development methodology focuses on UI/UX excellence, high-performance load times, and technical scalability tailored specifically to B2B conversion.</p>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px; font-size: 15px; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <thead>
            <tr style="background: #0f172a; color: white; text-align: left;">
              <th style="padding: 15px 20px; font-weight: 500;">Phase</th>
              <th style="padding: 15px 20px; font-weight: 500;">Milestone</th>
              <th style="padding: 15px 20px; font-weight: 500;">Timeline</th>
            </tr>
          </thead>
          <tbody style="background: white;">
            <tr>
              <td style="padding: 15px 20px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #334155;">Phase 1</td>
              <td style="padding: 15px 20px; border-bottom: 1px solid #e2e8f0;">Architecture, UX Strategy & B2B Copywriting</td>
              <td style="padding: 15px 20px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Weeks 1-2</td>
            </tr>
            <tr>
              <td style="padding: 15px 20px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #334155;">Phase 2</td>
              <td style="padding: 15px 20px; border-bottom: 1px solid #e2e8f0;">Technical Development, CMS & System Integration</td>
              <td style="padding: 15px 20px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Weeks 3-5</td>
            </tr>
            <tr>
              <td style="padding: 15px 20px; font-weight: 600; color: #334155;">Phase 3</td>
              <td style="padding: 15px 20px;">Launch, Quality Assurance & Lead Capture Optimization</td>
              <td style="padding: 15px 20px; color: #64748b;">Week 6</td>
            </tr>
          </tbody>
        </table>

        <!-- Section 6: CTA -->
        <div style="background: #0f172a; color: white; padding: 40px; text-align: center; border-radius: 8px;">
          <h3 style="color: white; margin: 0 0 15px 0; font-size: 24px;">Ready to modernise your sales infrastructure?</h3>
          <p style="color: #94a3b8; margin: 0 0 25px 0; font-size: 16px;">Schedule a brief, zero-pressure discovery call to review this architecture in detail.</p>
          <a href="https://calendly.com/xydris/15min" style="display: inline-block; background: #3b82f6; color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600; font-size: 16px;">Schedule Technical Review</a>
        </div>
      </div>
    `;


    
    // Create a new window for print
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(reportHTML);
      win.document.title = `Project Report - ${data['Business Name']}`;
      win.print();
    }
  };

  const filteredLeads = leads.filter(lead => 
    lead.name?.toLowerCase().includes(search.toLowerCase()) || 
    lead.company?.toLowerCase().includes(search.toLowerCase()) ||
    lead.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen lg:pl-64 bg-gray-50 font-sans pb-20 md:pb-0">
      <SideNav title="Leads" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 relative">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your raw prospects and marketing qualified leads.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
            <Filter size={18} /> Filter
          </button>
          <button 
            onClick={() => { setEditingLeadId(null); setFormData({ name: '', company: '', email: '', phone: '', source: 'Website', status: 'Untouched', address: '', googleLink: '' }); setIsModalOpen(true); }}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2"
          >
            <Plus size={18} /> Create Lead
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search leads by name, email, or company..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Lead Name</th>
                <th className="px-6 py-4 font-semibold">Company</th>
                <th className="px-6 py-4 font-semibold">Email & Phone</th>
                <th className="px-6 py-4 font-semibold">Lead Source</th>
                <th className="px-6 py-4 font-semibold">Lead Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">Loading leads...</td></tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No leads found. Click "Create Lead" to get started.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead: any) => (
                  <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                          {lead.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-900">{lead.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 flex items-center gap-2 cursor-pointer group" onClick={() => openEditModal(lead)}>
                      <Building2 size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors" /> 
                      <span className="group-hover:text-blue-600 font-medium transition-colors">{lead.company}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-2"><Mail size={14} className="text-slate-400"/> {lead.email}</span>
                        <span className="flex items-center gap-2"><Phone size={14} className="text-slate-400"/> {lead.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{lead.source}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${lead.status === 'Untouched' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 font-medium hover:underline mr-4">Convert</button>
                      {lead.phone && (
                        <a 
                          href={`https://wa.me/${lead.phone.replace(/[^\d]/g, '')}`}
                          target="_blank" 
                          rel="noreferrer"
                          className="text-emerald-500 hover:text-emerald-600 mr-4 inline-flex items-center gap-1 font-medium"
                        >
                          <MessageCircle size={16} /> WhatsApp
                        </a>
                      )}
                      <button className="text-slate-400 hover:text-slate-600"><MoreVertical size={18}/></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Lead Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">{editingLeadId ? "Edit Lead Profile" : "Create New Lead"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveLead} className="p-0 overflow-y-auto">
              <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100">
                <div className="p-6 space-y-4 flex-1">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                    <h3 className="font-semibold text-slate-800">Contact Details</h3>
                    <div className="flex gap-2">
                      {formData.googleLink && (
                        <a href={formData.googleLink} target="_blank" rel="noreferrer" className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-full hover:bg-slate-50 flex items-center gap-1 shadow-sm">
                          <ExternalLink size={12}/> Google Profile
                        </a>
                      )}
                    </div>
                  </div>
                  {formData.address && <p className="text-sm text-slate-500 mb-4 flex items-center gap-2"><Building2 size={14}/> {formData.address}</p>}
                  <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Lead Name *</label>
                  <input required type="text" className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Company *</label>
                  <input required type="text" className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                    value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
                  
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input type="email" className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                  <input type="tel" className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Lead Source</label>
                  <select className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                    value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})}>
                    <option>Website</option>
                    <option>Referral</option>
                    <option>Cold Call</option>
                    <option>Social Media</option>
                    <option>Trade Show</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Lead Status</label>
                  <select className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                    value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option>Untouched</option>
                    <option>Contacted</option>
                    <option>Attempted to Contact</option>
                    <option>Qualified</option>
                    <option>Junk Lead</option>
                  </select>
                </div>
              </div>

              

              
                </div>
                
                {currentLead?.outreachData && (
                  <div className="p-6 space-y-6 flex-1 bg-slate-50/50">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200">
                      <h3 className="font-semibold text-slate-800">Outreach Intelligence</h3>
                      <button type="button" onClick={generateProjectReport} className="text-xs flex items-center gap-1 bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full font-medium hover:bg-indigo-200 transition-colors">
                        <FileText size={14} /> Create Project Report
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Subject Sent</span>
                        <div className="mt-1 text-sm font-medium text-slate-800 bg-white p-2.5 rounded border border-slate-200">{currentLead.outreachData.subject || "No subject recorded"}</div>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Body Sent</span>
                        <div className="mt-1 text-sm text-slate-600 bg-white p-3 rounded border border-slate-200 h-32 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                          {currentLead.outreachData.body || "No email body recorded"}
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-blue-700 font-semibold mb-2">
                        <Lightbulb size={16} /> Suggested Product Pitch
                      </div>
                      <p className="text-sm text-blue-900 leading-relaxed">
                        <strong>Pitch Angle:</strong> {currentLead.outreachData["Primary Outreach Pitch Angle"]}<br/><br/>
                        <strong>Solution to Propose:</strong> {currentLead.outreachData["Recommended Web Solution"]}<br/><br/>
                        <em>Why?</em> They are currently losing B2B inquiries because {currentLead.outreachData["Missing Web Status"]?.toLowerCase()}.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 flex justify-end gap-3 border-t border-slate-200">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-md flex items-center gap-2">
                  {isSubmitting ? 'Saving...' : <><Save size={18} /> Save Lead</>}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </main>
    </div>
  );
}

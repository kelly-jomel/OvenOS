"use client";

import React, { useState } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ExternalLink, Plus, RefreshCw } from 'lucide-react';

type Lead = {
  name: string;
  phone_number?: string;
  address?: string;
  rating?: number;
  google_maps_uri?: string;
  _id: string;
  _added?: boolean;
};

export default function LeadGeneratorPage() {
  const [category, setCategory] = useState('Local businesses');
  const [city, setCity] = useState('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState('');
  const [isAddingAll, setIsAddingAll] = useState(false);

  const searchLeads = async (isLoadMore = false) => {
    if (!city) {
      alert("Please enter a city!");
      return;
    }

    const searchQuery = `${category} in ${city}`;
    
    if (!isLoadMore) {
      setLeads([]);
      setNextPageToken(null);
      setStatusMsg('Querying Google Places API... this might take a few seconds.');
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const requestBody: any = { query: searchQuery };
      if (isLoadMore && nextPageToken) {
        requestBody.page_token = nextPageToken;
      }

      const response = await fetch('https://lead-gen-backend-z821.onrender.com/api/v1/leads/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error("Unknown error occurred");
      }

      const data = await response.json();
      let newLeads: Lead[] = data.leads.map((l: any) => ({ ...l, _id: Math.random().toString(36).substring(7) }));
      
      setNextPageToken(data.next_page_token || null);

      if (!isLoadMore && newLeads.length === 0) {
        setStatusMsg('Search complete. 0 leads found.');
      } else {
        const filteredLeads: Lead[] = [];
        for (const lead of newLeads) {
          const exists = await checkIfLeadExists(lead);
          if (!exists) {
            filteredLeads.push(lead);
          }
        }
        
        setLeads(prev => [...prev, ...filteredLeads]);
        setStatusMsg('');
      }
    } catch (error: any) {
      console.error(error);
      setStatusMsg(`Error: ${error.message}`);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const checkIfLeadExists = async (lead: Lead) => {
    try {
      let q;
      if (lead.phone_number) {
        q = query(collection(db, "leads"), where("phone", "==", lead.phone_number));
      } else {
        q = query(collection(db, "leads"), where("company", "==", lead.name));
      }
      const snap = await getDocs(q);
      return !snap.empty;
    } catch (e) {
      console.error("Duplicate check failed", e);
      return false;
    }
  };

  const addLeadToDb = async (leadId: string) => {
    const lead = leads.find(l => l._id === leadId);
    if (!lead || lead._added) return;

    try {
      await addDoc(collection(db, "leads"), {
        company: lead.name,
        name: "Unknown Contact",
        phone: lead.phone_number || "",
        email: "",
        tags: [category],
        address: lead.address || "",
        googleLink: lead.google_maps_uri || "",
        status: "New",
        source: "Lead Generator Tool",
        createdAt: serverTimestamp()
      });
      
      setLeads(prev => prev.map(l => l._id === leadId ? { ...l, _added: true } : l));
    } catch (error) {
      console.error("Firebase error: ", error);
      alert("Failed to add lead");
    }
  };

  const addAllToDb = async () => {
    setIsAddingAll(true);
    try {
      const pendingLeads = leads.filter(l => !l._added);
      for (const lead of pendingLeads) {
        await addLeadToDb(lead._id);
      }
    } finally {
      setIsAddingAll(false);
    }
  };

  const freshCount = leads.filter(l => !l._added).length;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Local Lead Generator</h1>
        <p className="text-slate-500 mt-1">Find local businesses missing a website to pitch web design services.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700 font-medium"
          >
            <option value="Local businesses">All Categories</option>
            <optgroup label="Trades & Home Services">
                <option value="Plumbers">Plumbers</option>
                <option value="Roofers">Roofers</option>
                <option value="Electricians">Electricians</option>
                <option value="HVAC">HVAC</option>
                <option value="Landscapers">Landscapers</option>
                <option value="Painters">Painters</option>
                <option value="Carpenters">Carpenters</option>
                <option value="Pest Control">Pest Control</option>
                <option value="Cleaning Services">Cleaning</option>
                <option value="Locksmiths">Locksmiths</option>
                <option value="Contractors">Contractors</option>
            </optgroup>
            <optgroup label="Industrial & B2B">
                <option value="Factories">Factories</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Warehouses">Warehouses</option>
                <option value="Logistics">Logistics</option>
                <option value="Wholesale">Wholesale</option>
                <option value="Industrial">Industrial</option>
                <option value="Fabrication">Fabrication</option>
            </optgroup>
            <optgroup label="Health & Wellness">
                <option value="Dentists">Dentists</option>
                <option value="Chiropractors">Chiropractors</option>
                <option value="Therapists">Therapists</option>
                <option value="Gyms">Gyms & Fitness</option>
                <option value="Hair Salons">Hair Salons</option>
                <option value="Spas">Spas</option>
            </optgroup>
            <optgroup label="Professional Services">
                <option value="Accountants">Accountants</option>
                <option value="Lawyers">Lawyers</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Insurance">Insurance</option>
                <option value="Notaries">Notaries</option>
            </optgroup>
            <optgroup label="Retail & Hospitality">
                <option value="Restaurants">Restaurants</option>
                <option value="Cafes">Cafes & Coffee Shops</option>
                <option value="Auto Repair">Auto Repair</option>
                <option value="Boutiques">Boutiques</option>
                <option value="Florists">Florists</option>
            </optgroup>
          </select>
          <input 
            type="text" 
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchLeads()}
            placeholder="Enter a city (e.g. Palghar)" 
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
          />
          <button 
            onClick={() => searchLeads(false)} 
            disabled={loading}
            className="bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm whitespace-nowrap disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Find Leads'}
          </button>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="text-sm">
            {statusMsg && <span className="text-slate-500">{statusMsg}</span>}
            {!statusMsg && leads.length > 0 && freshCount > 0 && (
              <span className="text-green-600 font-medium">Showing {freshCount} fresh leads missing a website.</span>
            )}
            {!statusMsg && leads.length > 0 && freshCount === 0 && (
              <span className="text-slate-500">All found leads are already in your database! Try loading more or searching a new area.</span>
            )}
          </div>
          {leads.length > 0 && freshCount > 0 && (
            <button 
              onClick={addAllToDb}
              disabled={isAddingAll}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors shadow-sm font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {isAddingAll ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {isAddingAll ? 'Processing...' : 'Add All to Database'}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="p-4 font-semibold">Business Name</th>
                <th className="p-4 font-semibold">Rating</th>
                <th className="p-4 font-semibold">Phone</th>
                <th className="p-4 font-semibold">Address</th>
                <th className="p-4 font-semibold text-center">Google Profile</th>
                <th className="p-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.map((lead) => {
                if (lead._added) return null; // hide added leads
                return (
                  <tr key={lead._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-900">{lead.name || 'N/A'}</td>
                    <td className="p-4 text-slate-700">{lead.rating ? `${lead.rating} ⭐` : <span className="text-slate-400">N/A</span>}</td>
                    <td className="p-4 text-slate-700">{lead.phone_number || <span className="text-slate-400">No Phone</span>}</td>
                    <td className="p-4 text-slate-600 text-sm max-w-xs truncate">{lead.address || 'N/A'}</td>
                    <td className="p-4 text-center text-sm">
                      {lead.google_maps_uri ? (
                        <a href={lead.google_maps_uri} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                          View <ExternalLink size={14} />
                        </a>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => addLeadToDb(lead._id)}
                        className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-xs hover:bg-green-200 transition-colors font-medium whitespace-nowrap flex items-center gap-1"
                      >
                        <Plus size={14} /> Add
                      </button>
                    </td>
                  </tr>
                );
              })}
              {leads.length === 0 && !loading && !statusMsg && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500">
                    Search above to generate local leads
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {nextPageToken && leads.length > 0 && (
        <div className="mt-6 flex justify-center">
          <button 
            onClick={() => searchLeads(true)}
            disabled={loadingMore}
            className="bg-white border border-slate-300 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-50 transition-colors font-medium shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {loadingMore ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
            {loadingMore ? 'Loading...' : 'Load More Leads'}
          </button>
        </div>
      )}
    </div>
  );
}

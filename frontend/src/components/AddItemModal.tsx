'use client';
import React, { useState } from 'react';

type AddItemModalProps = {
  onItemAdded: (item: any) => void;
  onClose: () => void;
};

export default function AddItemModal({ onItemAdded, onClose }: AddItemModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onItemAdded({ name, description, price: Number(price) });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Add New Catalog Item</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Item Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="w-full p-2 border border-slate-300 rounded-md outline-none focus:border-blue-500 text-sm" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
            <input 
              type="text" 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              className="w-full p-2 border border-slate-300 rounded-md outline-none focus:border-blue-500 text-sm" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Price / Rate</label>
            <input 
              type="number" 
              step="0.01"
              min="0"
              value={price} 
              onChange={e => setPrice(e.target.value)} 
              className="w-full p-2 border border-slate-300 rounded-md outline-none focus:border-blue-500 text-sm" 
              required 
            />
          </div>
          
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700">Save Item</button>
          </div>
        </form>
      </div>
    </div>
  );
}

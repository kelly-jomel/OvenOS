import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { X } from 'lucide-react';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientAdded: (client: any) => void;
}

export default function AddClientModal({ isOpen, onClose, onClientAdded }: AddClientModalProps) {
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [isAddingClient, setIsAddingClient] = useState(false);

  if (!isOpen) return null;

  const handleAddNewClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingClient(true);
    try {
      const docRef = await addDoc(collection(db, "clients"), {
        name: newClientName,
        displayName: newClientName, // Ensure displayName is set for new UI compatibility
        email: newClientEmail,
        gstin: "",
        address: "",
        createdAt: serverTimestamp()
      });
      const newClient = { id: docRef.id, name: newClientName, displayName: newClientName, email: newClientEmail, gstin: "", address: "" };
      onClientAdded(newClient);
      setNewClientName("");
      setNewClientEmail("");
      onClose();
    } catch (error) {
      console.error("Error adding client:", error);
    } finally {
      setIsAddingClient(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">Add New Customer</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleAddNewClient} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name *</label>
            <input required type="text" className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-blue-500" value={newClientName} onChange={e => setNewClientName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input type="email" className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-blue-500" value={newClientEmail} onChange={e => setNewClientEmail(e.target.value)} />
          </div>
          <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
            <button type="button" onClick={onClose} className="px-5 py-2.5 font-medium text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
            <button type="submit" disabled={isAddingClient} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium">{isAddingClient ? 'Saving...' : 'Save & Select'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

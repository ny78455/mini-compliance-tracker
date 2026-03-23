import React, { useState } from 'react';
import { useStore } from '../store';
import { createClient, deleteClient } from '../services/api';
import { Plus, Building2, Globe, Briefcase, X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { ConfirmModal } from './ConfirmModal';

export const Sidebar: React.FC<{ onCloseMobile?: () => void }> = ({ onCloseMobile }) => {
  const { clients, selectedClientId, setSelectedClientId, addClient, deleteClient: deleteStoreClient } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newClient, setNewClient] = useState({ company_name: '', country: '', entity_type: 'LLC' });
  const [clientToDelete, setClientToDelete] = useState<{ id: string; name: string } | null>(null);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const client = await createClient(newClient);
      addClient(client);
      setIsAdding(false);
      setNewClient({ company_name: '', country: '', entity_type: 'LLC' });
      toast.success('Client added successfully');
    } catch (error: any) {
      console.error('Failed to add client', error);
      if (error.message?.includes('row-level security policy')) {
        toast.error('RLS Error: Please disable Row Level Security in Supabase for the "clients" table.', { duration: 6000 });
      } else {
        toast.error('Failed to add client');
      }
    }
  };

  const confirmDeleteClient = async () => {
    if (!clientToDelete) return;
    
    try {
      await deleteClient(clientToDelete.id);
      deleteStoreClient(clientToDelete.id);
      toast.success('Client deleted');
    } catch (error: any) {
      console.error('Failed to delete client', error);
      if (error.message?.includes('row-level security policy')) {
        toast.error('RLS Error: Please check Row Level Security in Supabase.', { duration: 6000 });
      } else {
        toast.error('Failed to delete client');
      }
    } finally {
      setClientToDelete(null);
    }
  };

  const handleDeleteClientClick = (e: React.MouseEvent, id: string, companyName: string) => {
    e.stopPropagation();
    setClientToDelete({ id, name: companyName });
  };

  return (
    <div className="w-72 bg-[#FAFAFA] border-r border-neutral-200 h-full flex flex-col font-sans">
      <div className="p-6 border-b border-neutral-200 flex justify-between items-center bg-white">
        <h2 className="text-xl font-serif text-neutral-900 flex items-center gap-2 tracking-tight">
          <Briefcase className="w-5 h-5 text-neutral-900" />
          Clients
        </h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="p-1.5 hover:bg-neutral-100 rounded-md transition-colors text-neutral-600 hover:text-neutral-900"
        >
          {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            onSubmit={handleAddClient}
            className="overflow-hidden border-b border-neutral-200 bg-white"
          >
            <div className="p-5 flex flex-col gap-3">
              <input
                type="text"
                placeholder="Company Name"
                required
                className="w-full p-2.5 bg-[#FAFAFA] border border-neutral-200 rounded-md text-sm focus:outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 transition-all"
                value={newClient.company_name}
                onChange={(e) => setNewClient({ ...newClient, company_name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Country"
                required
                className="w-full p-2.5 bg-[#FAFAFA] border border-neutral-200 rounded-md text-sm focus:outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 transition-all"
                value={newClient.country}
                onChange={(e) => setNewClient({ ...newClient, country: e.target.value })}
              />
              <select
                className="w-full p-2.5 bg-[#FAFAFA] border border-neutral-200 rounded-md text-sm focus:outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 transition-all"
                value={newClient.entity_type}
                onChange={(e) => setNewClient({ ...newClient, entity_type: e.target.value })}
              >
                <option value="LLC">LLC</option>
                <option value="Inc">Inc</option>
                <option value="LTD">LTD</option>
                <option value="Corp">Corp</option>
              </select>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-neutral-900 text-white py-2 rounded-md text-sm font-medium hover:bg-black transition-colors">
                  Save Client
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto bg-[#FAFAFA]">
        {clients.length === 0 ? (
          <div className="p-8 text-sm text-neutral-500 text-center font-serif italic">No clients found.</div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {clients.map((client) => (
              <li key={client.id} className="relative group">
                <button
                  onClick={() => {
                    setSelectedClientId(client.id);
                    onCloseMobile?.();
                  }}
                  className={`w-full text-left p-5 pr-12 transition-all duration-200 ${
                    selectedClientId === client.id 
                      ? 'bg-white border-l-4 border-neutral-900 shadow-sm' 
                      : 'border-l-4 border-transparent hover:bg-white/60'
                  }`}
                >
                  <div className={`font-medium truncate ${selectedClientId === client.id ? 'text-neutral-900' : 'text-neutral-700'}`}>
                    {client.company_name}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1.5 flex items-center gap-3 font-mono">
                    <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> {client.country}</span>
                    <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> {client.entity_type}</span>
                  </div>
                </button>
                <button
                  onClick={(e) => handleDeleteClientClick(e, client.id, client.company_name)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                  title="Delete Client"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmModal
        isOpen={clientToDelete !== null}
        title="Delete Client"
        message={`Are you sure you want to delete ${clientToDelete?.name}? All associated tasks will be permanently deleted.`}
        onConfirm={confirmDeleteClient}
        onCancel={() => setClientToDelete(null)}
      />
    </div>
  );
};
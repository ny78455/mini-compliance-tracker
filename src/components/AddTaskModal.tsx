import React, { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: any) => void;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onSave }) => {
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'Compliance',
    due_date: format(new Date(), 'yyyy-MM-dd'),
    priority: 'Medium',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(newTask);
    setNewTask({
      title: '',
      description: '',
      category: 'Compliance',
      due_date: format(new Date(), 'yyyy-MM-dd'),
      priority: 'Medium',
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-xl shadow-xl z-50 overflow-hidden"
          >
            <form onSubmit={handleSubmit}>
              <div className="flex justify-between items-center p-6 border-b border-neutral-100">
                <h3 className="text-xl font-serif text-neutral-900 tracking-tight">Book Task</h3>
                <button type="button" onClick={onClose} className="text-neutral-400 hover:text-neutral-900 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-xs font-mono text-neutral-500 uppercase tracking-wider mb-2">Title</label>
                  <input
                    type="text" required
                    className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-neutral-200 rounded-md text-sm focus:ring-1 focus:ring-neutral-400 focus:outline-none transition-all"
                    value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-neutral-500 uppercase tracking-wider mb-2">Due Date</label>
                  <input
                    type="date" required
                    className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-neutral-200 rounded-md text-sm focus:ring-1 focus:ring-neutral-400 focus:outline-none transition-all"
                    value={newTask.due_date} onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-neutral-500 uppercase tracking-wider mb-2">Category</label>
                  <select
                    className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-neutral-200 rounded-md text-sm focus:ring-1 focus:ring-neutral-400 focus:outline-none transition-all"
                    value={newTask.category} onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                  >
                    <option value="Tax">Tax</option>
                    <option value="Filing">Filing</option>
                    <option value="Legal">Legal</option>
                    <option value="Compliance">Compliance</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-mono text-neutral-500 uppercase tracking-wider mb-2">Priority</label>
                  <div className="flex gap-3">
                    {['Low', 'Medium', 'High'].map((p) => (
                      <label key={p} className="flex-1 cursor-pointer">
                        <input 
                          type="radio" 
                          name="priority" 
                          value={p} 
                          checked={newTask.priority === p}
                          onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                          className="sr-only"
                        />
                        <div className={`text-center py-2 border rounded-md text-sm transition-all ${
                          newTask.priority === p 
                            ? p === 'High' ? 'bg-red-50 border-red-200 text-red-700' 
                            : p === 'Medium' ? 'bg-amber-50 border-amber-200 text-amber-700'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50'
                        }`}>
                          {p}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-mono text-neutral-500 uppercase tracking-wider mb-2">Description (Optional)</label>
                  <textarea
                    className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-neutral-200 rounded-md text-sm focus:ring-1 focus:ring-neutral-400 focus:outline-none transition-all"
                    rows={3} value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="p-6 border-t border-neutral-100 bg-[#FAFAFA] flex justify-end gap-3">
                <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 text-sm font-medium text-white bg-neutral-900 rounded-md hover:bg-black transition-colors shadow-sm">
                  Save Task
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

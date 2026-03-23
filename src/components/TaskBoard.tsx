import React, { useState, useEffect, useMemo } from 'react';
import { useStore, Task } from '../store';
import { fetchTasks, createTask, updateTask, deleteTask } from '../services/api';
import { CheckCircle2, Circle, Clock, AlertCircle, Trash2, Plus, Calendar, Tag, AlertTriangle, Briefcase, Globe, X, ChevronDown, ChevronUp } from 'lucide-react';
import { format, isBefore, startOfDay } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { AddTaskModal } from './AddTaskModal';
import { ConfirmModal } from './ConfirmModal';

export const TaskBoard: React.FC = () => {
  const { selectedClientId, clients, tasks, setTasks, addTask, updateTask: updateStoreTask, deleteTask: deleteStoreTask } = useStore();
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'dueDateAsc' | 'dueDateDesc' | 'priority'>('dueDateAsc');
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const selectedClient = clients.find(c => c.id === selectedClientId);

  useEffect(() => {
    if (selectedClientId) {
      fetchTasks(selectedClientId).then(setTasks).catch(console.error);
    }
  }, [selectedClientId, setTasks]);

  const handleAddTask = async (taskData: any) => {
    if (!selectedClientId) return;
    
    try {
      const task = await createTask({
        ...taskData,
        client_id: selectedClientId,
        status: 'Pending',
      });
      addTask(task);
      setIsAddingTask(false);
      toast.success('Task booked successfully');
    } catch (error: any) {
      console.error('Failed to add task', error);
      if (error.message?.includes('row-level security policy')) {
        toast.error('RLS Error: Please disable Row Level Security in Supabase for the "tasks" table.', { duration: 6000 });
      } else {
        toast.error('Failed to book task');
      }
    }
  };

  const handleToggleStatus = async (task: Task) => {
    const newStatus = task.status === 'Pending' ? 'Completed' : 'Pending';
    try {
      await updateTask(task.id, { status: newStatus });
      updateStoreTask(task.id, { status: newStatus });
      toast.success(newStatus === 'Completed' ? 'Task marked as completed' : 'Task marked as pending');
    } catch (error: any) {
      console.error('Failed to update task status', error);
      if (error.message?.includes('row-level security policy')) {
        toast.error('RLS Error: Please disable Row Level Security in Supabase for the "tasks" table.', { duration: 6000 });
      } else {
        toast.error('Failed to update task status');
      }
    }
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      await deleteTask(taskToDelete);
      deleteStoreTask(taskToDelete);
      toast.success('Task deleted');
    } catch (error: any) {
      console.error('Failed to delete task', error);
      if (error.message?.includes('row-level security policy')) {
        toast.error('RLS Error: Please disable Row Level Security in Supabase for the "tasks" table.', { duration: 6000 });
      } else {
        toast.error('Failed to delete task');
      }
    } finally {
      setTaskToDelete(null);
    }
  };

  const toggleExpandTask = (id: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const isOverdue = (task: Task) => {
    if (task.status === 'Completed') return false;
    const dueDate = startOfDay(new Date(task.due_date));
    const today = startOfDay(new Date());
    return isBefore(dueDate, today);
  };

  const filteredTasks = useMemo(() => {
    let result = tasks.filter(task => {
      const matchStatus = filterStatus === 'All' || task.status === filterStatus;
      const matchCategory = filterCategory === 'All' || task.category === filterCategory;
      const matchPriority = filterPriority === 'All' || task.priority === filterPriority;
      const matchSearch = (task.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchStatus && matchCategory && matchPriority && matchSearch;
    });

    result.sort((a, b) => {
      if (sortBy === 'dueDateAsc') {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      } else if (sortBy === 'dueDateDesc') {
        return new Date(b.due_date).getTime() - new Date(a.due_date).getTime();
      } else if (sortBy === 'priority') {
        const priorityWeight = { High: 3, Medium: 2, Low: 1 };
        const weightA = priorityWeight[a.priority as keyof typeof priorityWeight] || 0;
        const weightB = priorityWeight[b.priority as keyof typeof priorityWeight] || 0;
        return weightB - weightA;
      }
      return 0;
    });

    return result;
  }, [tasks, filterStatus, filterCategory, filterPriority, searchQuery, sortBy]);

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
  };

  if (!selectedClientId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-10 max-w-md"
        >
          <Briefcase className="w-12 h-12 text-neutral-300 mx-auto mb-6" />
          <h2 className="text-3xl font-serif text-neutral-900 mb-3 tracking-tight">Financial Leadership</h2>
          <p className="text-neutral-500 text-sm leading-relaxed">Select a client from the sidebar to view their financials, manage compliance tasks, and maintain investor-ready books.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden font-sans">
      {/* Editorial Header */}
      <div className="bg-white border-b border-neutral-200 px-8 py-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <motion.h1 
            key={selectedClient?.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-serif text-neutral-900 tracking-tight"
          >
            {selectedClient?.company_name}
          </motion.h1>
          <p className="text-sm text-neutral-500 mt-3 flex items-center gap-3 font-mono">
            <Globe className="w-4 h-4" /> {selectedClient?.country} 
            <span className="text-neutral-300">|</span> 
            {selectedClient?.entity_type} Entity
          </p>
        </div>
        <button
          onClick={() => setIsAddingTask(true)}
          className="flex items-center gap-2 bg-neutral-900 text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-black transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Book Task
        </button>
      </div>

      {/* Minimalist Dashboard */}
      <div className="px-8 py-6 flex flex-col gap-6 bg-[#FAFAFA] border-b border-neutral-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Tasks', value: tasks.length, icon: Briefcase },
            { label: 'Pending', value: tasks.filter(t => t.status === 'Pending').length, icon: Clock },
            { label: 'Completed', value: tasks.filter(t => t.status === 'Completed').length, icon: CheckCircle2 },
            { label: 'Overdue', value: tasks.filter(isOverdue).length, icon: AlertTriangle, alert: true }
          ].map((stat, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={stat.label} 
              className="bg-white p-5 rounded-md border border-neutral-200 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-mono text-neutral-500 uppercase tracking-wider">{stat.label}</p>
                <stat.icon className={`w-4 h-4 ${stat.alert && stat.value > 0 ? 'text-red-500' : 'text-neutral-400'}`} />
              </div>
              <p className={`text-3xl font-serif ${stat.alert && stat.value > 0 ? 'text-red-600' : 'text-neutral-900'}`}>
                {stat.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Clean Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <input
            type="text"
            placeholder="Search tasks..."
            className="flex-1 px-4 py-2.5 bg-white border border-neutral-200 rounded-md text-sm focus:outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 transition-all w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="flex gap-4 w-full sm:w-auto">
            <select
              className="px-4 py-2.5 bg-white border border-neutral-200 rounded-md text-sm focus:outline-none focus:border-neutral-400 transition-all w-full sm:w-auto"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </select>
            <select
              className="px-4 py-2.5 bg-white border border-neutral-200 rounded-md text-sm focus:outline-none focus:border-neutral-400 transition-all w-full sm:w-auto"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Tax">Tax</option>
              <option value="Filing">Filing</option>
              <option value="Legal">Legal</option>
              <option value="Compliance">Compliance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto px-8 py-6 bg-white">
        <AddTaskModal 
          isOpen={isAddingTask} 
          onClose={() => setIsAddingTask(false)} 
          onSave={handleAddTask} 
        />

        {filteredTasks.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <CheckCircle2 className="w-10 h-10 text-neutral-200 mx-auto mb-4" />
            <h3 className="text-xl font-serif text-neutral-900">All caught up.</h3>
            <p className="text-neutral-500 text-sm mt-2">Books are clean and investor-ready.</p>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-3"
          >
            <AnimatePresence>
              {filteredTasks.map(task => {
                const overdue = isOverdue(task);
                const completed = task.status === 'Completed';
                
                const isExpanded = expandedTasks.has(task.id);
                
                return (
                  <motion.div 
                    layout
                    variants={itemVariants}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    key={task.id} 
                    className={`group bg-white p-5 rounded-md border flex flex-col sm:flex-row gap-5 transition-all ${
                      overdue && !completed ? 'border-red-200 bg-red-50/10' : 
                      completed ? 'border-neutral-100 bg-neutral-50/50' : 'border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    <div className="flex items-start pt-0.5">
                      <button 
                        onClick={() => handleToggleStatus(task)}
                        className={`transition-colors ${
                          completed ? 'text-neutral-900' : 'text-neutral-300 hover:text-neutral-900'
                        }`}
                      >
                        {completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                      </button>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        <h3 className={`text-base font-medium truncate ${completed ? 'text-neutral-400 line-through' : 'text-neutral-900'}`}>
                          {task.title}
                        </h3>
                        {overdue && !completed && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-mono uppercase tracking-wider bg-red-100 text-red-700">
                            Overdue
                          </span>
                        )}
                      </div>
                      
                      {task.description && (
                        <div className="mb-4">
                          <p className={`text-sm ${completed ? 'text-neutral-400' : 'text-neutral-600'} ${!isExpanded ? 'line-clamp-2' : ''}`}>
                            {task.description}
                          </p>
                          {task.description.length > 100 && (
                            <button 
                              onClick={() => toggleExpandTask(task.id)}
                              className="text-xs font-medium text-neutral-500 hover:text-neutral-900 mt-1 flex items-center gap-1"
                            >
                              {isExpanded ? <>Show less <ChevronUp className="w-3 h-3" /></> : <>Read more <ChevronDown className="w-3 h-3" /></>}
                            </button>
                          )}
                        </div>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-neutral-500 uppercase tracking-wide">
                        <span className={`flex items-center gap-1.5 ${overdue && !completed ? 'text-red-600 font-semibold' : ''}`}>
                          <Calendar className="w-3.5 h-3.5" />
                          {format(new Date(task.due_date), 'MMM d, yyyy')}
                        </span>
                        
                        <span className="flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5" />
                          {task.category}
                        </span>
                        
                        <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-sm ${
                          task.priority === 'High' ? 'bg-red-50 text-red-700 border border-red-100' : 
                          task.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            task.priority === 'High' ? 'bg-red-500' : 
                            task.priority === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}></span>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex sm:flex-col items-center justify-end gap-2 border-t sm:border-t-0 sm:border-l border-neutral-100 pt-4 sm:pt-0 sm:pl-5 mt-4 sm:mt-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setTaskToDelete(task.id)}
                        className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete Task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <ConfirmModal
        isOpen={taskToDelete !== null}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={confirmDeleteTask}
        onCancel={() => setTaskToDelete(null)}
      />
    </div>
  );
};
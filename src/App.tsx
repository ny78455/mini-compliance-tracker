import React, { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TaskBoard } from './components/TaskBoard';
import { Auth } from './components/Auth';
import { useStore } from './store';
import { fetchClients } from './services/api';
import { supabase } from './lib/supabase';
import { ShieldCheck, Menu, X, LogOut } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { Session } from '@supabase/supabase-js';

export default function App() {
  const { clients, setClients, selectedClientId, setSelectedClientId } = useStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Session error:', error);
        setError(error.message);
      }
      setSession(session);
      setIsAuthLoading(false);
    }).catch((err) => {
      console.error('Session catch error:', err);
      setError(err.message || 'Failed to connect to Supabase.');
      setIsAuthLoading(false);
    });
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    
    fetchClients().then((fetchedClients) => {
      setClients(fetchedClients);
      if (fetchedClients.length > 0) {
        setSelectedClientId(fetchedClients[0].id);
      }
      setError(null);
    }).catch((err) => {
      console.error(err);
      setError(err.message || 'Failed to connect to the database.');
    });
  }, [session]); // Only run when session changes

  if (isAuthLoading) {
    return <div className="flex items-center justify-center h-screen bg-[#FAFAFA] font-sans text-neutral-500">Loading...</div>;
  }

  if (!session) {
    return (
      <>
        <Toaster position="top-right" />
        <Auth />
      </>
    );
  }

  if (error) {
    const isMissingTable = error.includes('Could not find the table') || error.includes('relation "public.clients" does not exist');
    
    return (
      <div className="flex flex-col h-screen bg-[#FAFAFA] font-sans items-center justify-center p-6 overflow-y-auto">
        <div className="bg-white border border-red-200 shadow-sm p-8 rounded-xl max-w-2xl w-full">
          <h2 className="text-red-700 text-2xl font-serif tracking-tight mb-2">
            {isMissingTable ? 'Database Setup Required' : 'Database Connection Error'}
          </h2>
          <p className="text-neutral-700 mb-6 text-sm">{error}</p>
          
          {isMissingTable ? (
            <div className="text-left">
              <p className="text-sm text-neutral-600 mb-4">
                It looks like your Supabase project is active, but the required tables haven't been created yet. 
                Please run the following SQL script in your Supabase SQL Editor:
              </p>
              <div className="bg-neutral-900 rounded-lg p-4 mb-6 overflow-x-auto relative group">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  company_name TEXT NOT NULL,
  country TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  priority TEXT NOT NULL DEFAULT 'Medium',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add user_id to existing tables if they were created before auth was added
ALTER TABLE clients ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();

-- Enable Row Level Security (RLS)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to avoid conflicts
DROP POLICY IF EXISTS "Users can manage their own clients" ON clients;
DROP POLICY IF EXISTS "Users can manage their own tasks" ON tasks;

-- Create policies for clients
CREATE POLICY "Users can manage their own clients" 
  ON clients FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- Create policies for tasks
CREATE POLICY "Users can manage their own tasks" 
  ON tasks FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);`);
                    toast.success('SQL copied to clipboard!');
                  }}
                  className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 rounded transition-colors opacity-0 group-hover:opacity-100"
                >
                  Copy SQL
                </button>
                <pre className="text-emerald-400 text-xs font-mono whitespace-pre-wrap">
{`-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  company_name TEXT NOT NULL,
  country TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  priority TEXT NOT NULL DEFAULT 'Medium',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add user_id to existing tables if they were created before auth was added
ALTER TABLE clients ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();

-- Enable Row Level Security (RLS)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to avoid conflicts
DROP POLICY IF EXISTS "Users can manage their own clients" ON clients;
DROP POLICY IF EXISTS "Users can manage their own tasks" ON tasks;

-- Create policies for clients
CREATE POLICY "Users can manage their own clients" 
  ON clients FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- Create policies for tasks
CREATE POLICY "Users can manage their own tasks" 
  ON tasks FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);`}
                </pre>
              </div>
              <ol className="list-decimal list-inside text-sm text-neutral-600 space-y-2 mb-6">
                <li>Go to your <a href="https://app.supabase.com" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Supabase Dashboard</a></li>
                <li>Select your project</li>
                <li>Click on <strong>SQL Editor</strong> in the left sidebar</li>
                <li>Click <strong>New query</strong></li>
                <li>Paste the SQL above and click <strong>Run</strong></li>
              </ol>
            </div>
          ) : error.includes('NetworkError') || error.includes('fetch') ? (
            <div className="text-left">
              <p className="text-sm text-neutral-600 mb-4">
                It looks like the app cannot connect to Supabase. This usually happens when:
              </p>
              <ul className="list-disc list-inside text-sm text-neutral-600 space-y-2 mb-6">
                <li>You haven't set up your own Supabase project yet.</li>
                <li>Your Supabase project is paused.</li>
                <li>Your adblocker or browser is blocking the connection.</li>
              </ul>
              <p className="text-sm text-neutral-600 mb-4 font-medium">
                To fix this, please set up your own Supabase project:
              </p>
              <ol className="list-decimal list-inside text-sm text-neutral-600 space-y-2 mb-6">
                <li>Go to <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Supabase</a> and create a new project.</li>
                <li>Get your <strong>Project URL</strong> and <strong>anon key</strong> from Project Settings &gt; API.</li>
                <li>Ask the AI to update your environment variables with these values.</li>
              </ol>
            </div>
          ) : (
            <p className="text-sm text-red-500 mb-6">
              If you are seeing "Could not query the database for the schema cache", your Supabase project might be paused. 
              Please go to your Supabase dashboard and unpause/restore the project.
            </p>
          )}
          
          <button 
            onClick={() => window.location.reload()} 
            className="w-full py-3 bg-neutral-900 text-white rounded-lg hover:bg-black transition-colors font-medium"
          >
            I've done this, reload app
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#FAFAFA] font-sans">
      <Toaster position="top-right" />
      
      <header className="bg-neutral-900 text-white p-4 flex items-center justify-between shadow-sm z-20 relative">
        <div className="flex items-center gap-3">
          <button 
            className="md:hidden p-1 hover:bg-neutral-800 rounded-md transition-colors"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <ShieldCheck className="w-6 h-6 text-neutral-300 hidden sm:block" />
          <h1 className="text-xl font-serif tracking-tight">Mini Compliance Tracker</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-neutral-400 font-mono hidden sm:block">
            Admin Dashboard
          </div>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors ml-4"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-10 md:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <div className={`
          absolute md:relative z-10 h-full transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <Sidebar onCloseMobile={() => setIsSidebarOpen(false)} />
        </div>

        <div className="flex-1 overflow-hidden w-full">
          <TaskBoard />
        </div>
      </div>
    </div>
  );
}

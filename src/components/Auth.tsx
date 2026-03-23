import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success('Success! You can now log in.');
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('Logged in successfully');
      }
    } catch (error: any) {
      if (error.message?.includes('NetworkError') || error.message?.includes('fetch')) {
        toast.error('Network error: Please check your Supabase URL and Anon Key, or ensure your project is active.', { duration: 6000 });
      } else {
        toast.error(error.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#FAFAFA] font-sans items-center justify-center p-6">
      <div className="bg-white border border-neutral-200 shadow-sm p-8 rounded-xl max-w-md w-full">
        <div className="flex justify-center mb-6">
          <ShieldCheck className="w-12 h-12 text-neutral-900" />
        </div>
        <h2 className="text-2xl font-serif text-center tracking-tight mb-6">
          {isSignUp ? 'Create an Account' : 'Welcome Back'}
        </h2>
        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 bg-[#FAFAFA] border border-neutral-200 rounded-md text-sm focus:outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 bg-[#FAFAFA] border border-neutral-200 rounded-md text-sm focus:outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-neutral-900 text-white rounded-md hover:bg-black transition-colors font-medium mt-2 disabled:opacity-50"
          >
            {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Log In'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
};

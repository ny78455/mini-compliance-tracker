import { Client, Task } from '../store';
import { supabase } from '../lib/supabase';

export const fetchClients = async (): Promise<Client[]> => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('company_name');
    
  if (error) throw new Error(error.message);
  return data || [];
};

export const createClient = async (client: Omit<Client, 'id' | 'created_at'>): Promise<Client> => {
  const { data, error } = await supabase
    .from('clients')
    .insert([client])
    .select()
    .single();
    
  if (error) throw new Error(error.message);
  return data;
};

export const deleteClient = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);
    
  if (error) throw new Error(error.message);
};

export const fetchTasks = async (clientId?: string): Promise<Task[]> => {
  let query = supabase.from('tasks').select('*');
  
  if (clientId) {
    query = query.eq('client_id', clientId);
  }
  
  const { data, error } = await query.order('due_date');
  
  if (error) throw new Error(error.message);
  return data || [];
};

export const createTask = async (task: Omit<Task, 'id' | 'created_at'>): Promise<Task> => {
  const { data, error } = await supabase
    .from('tasks')
    .insert([task])
    .select()
    .single();
    
  if (error) throw new Error(error.message);
  return data;
};

export const updateTask = async (id: string, updates: Partial<Task>): Promise<void> => {
  const { error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id);
    
  if (error) throw new Error(error.message);
};

export const deleteTask = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);
    
  if (error) throw new Error(error.message);
};

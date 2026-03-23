import { create } from 'zustand';

export interface Client {
  id: string;
  company_name: string;
  country: string;
  entity_type: string;
  created_at: string;
}

export interface Task {
  id: string;
  client_id: string;
  title: string;
  description: string;
  category: string;
  due_date: string;
  status: string;
  priority: string;
  created_at: string;
}

interface AppState {
  clients: Client[];
  tasks: Task[];
  selectedClientId: string | null;
  setClients: (clients: Client[]) => void;
  setTasks: (tasks: Task[]) => void;
  setSelectedClientId: (id: string | null) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addClient: (client: Client) => void;
  deleteClient: (id: string) => void;
}

export const useStore = create<AppState>((set) => ({
  clients: [],
  tasks: [],
  selectedClientId: null,
  setClients: (clients) => set({ clients }),
  setTasks: (tasks) => set({ tasks }),
  setSelectedClientId: (id) => set({ selectedClientId: id }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  deleteTask: (id) =>
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),
  addClient: (client) => set((state) => ({ clients: [...state.clients, client] })),
  deleteClient: (id) => set((state) => {
    const newClients = state.clients.filter((c) => c.id !== id);
    return {
      clients: newClients,
      selectedClientId: state.selectedClientId === id 
        ? (newClients.length > 0 ? newClients[0].id : null) 
        : state.selectedClientId
    };
  }),
}));

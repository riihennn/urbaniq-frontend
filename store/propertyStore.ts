import { create } from 'zustand';
import { IProperty, IPropertyFilter } from '../types/property';
import api from '../lib/api';

interface PropertyState {
  properties: IProperty[];
  currentProperty: IProperty | null;
  isLoading: boolean;
  error: string | null;
  fetchProperties: (filters: IPropertyFilter) => Promise<void>;
  fetchPropertyById: (id: string) => Promise<void>;
}

export const usePropertyStore = create<PropertyState>((set) => ({
  properties: [],
  currentProperty: null,
  isLoading: false,
  error: null,

  fetchProperties: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/properties', { params: filters });
      set({ properties: response.data || [], isLoading: false });
    } catch (err: any) {
      set({ 
        error: err.response?.data?.message || err.message || 'Failed to fetch properties', 
        isLoading: false 
      });
    }
  },

  fetchPropertyById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/properties/${id}`);
      set({ currentProperty: response.data || null, isLoading: false });
    } catch (err: any) {
      set({ 
        error: err.response?.data?.message || err.message || 'Failed to fetch property details', 
        isLoading: false 
      });
    }
  }
}));

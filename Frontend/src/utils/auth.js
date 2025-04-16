import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },
      
      setToken: (token) => {
        set({ token, isAuthenticated: !!token });
        if (token) {
          localStorage.setItem('token', token);
        } else {
          localStorage.removeItem('token');
        }
      },
      
      getToken: () => {
        const token = get().token || localStorage.getItem('token');
        if (!token) {
          set({ token: null, isAuthenticated: false, user: null });
          return null;
        }
        return token;
      },

      setLoading: (isLoading) => set({ isLoading }),

      login: async (email, password) => {
        try {
          set({ isLoading: true });
          
          const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Login failed');
          }

          // Create complete user object with data from the response
          const completeUser = {
            ...data.user,
            first_name: data.user.first_name || data.user.firstName || '',
            last_name: data.user.last_name || data.user.lastName || '',
            email: data.user.email,
            role: data.user.role
          };

          set({
            user: completeUser,
            token: data.token,
            isAuthenticated: true,
            isLoading: false
          });

          // Store token in localStorage for API requests
          localStorage.setItem('token', data.token);

          console.log('Login successful:', { 
            user: completeUser.email, 
            name: `${completeUser.first_name} ${completeUser.last_name}`,
            role: completeUser.role,
            isAuthenticated: true 
          });

          return { success: true };
        } catch (error) {
          console.error('Error during login:', error);
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false
          });
          return { success: false, error: error.message };
        }
      },

      logout: () => {
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false,
          isLoading: false 
        });

        // Remove token from localStorage
        localStorage.removeItem('token');

        console.log('Logout successful');
      },

      signup: async (email, password, firstName, lastName, role = 'user') => {
        try {
          const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              password,
              first_name: firstName,
              last_name: lastName,
              role
            })
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Failed to create account');
          }

          // Automatically log in after successful signup
          get().login(data.user, data.token);

          return {
            success: true,
            message: 'Account created successfully',
            user: data.user,
            token: data.token
          };
        } catch (error) {
          console.error('Signup error:', error);
          return {
            success: false,
            error: error.message
          };
        }
      },

      // Helper function to make authenticated API calls
      fetchWithAuth: async (url, options = {}) => {
        const token = get().getToken();
        if (!token) {
          throw new Error('No authentication token found');
        }

        const defaultOptions = {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        };

        try {
          const response = await fetch(url, { ...defaultOptions, ...options });
          
          if (response.status === 401) {
            get().logout();
            throw new Error('Session expired');
          }

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Request failed');
          }

          return response;
        } catch (error) {
          console.error('API request failed:', error);
          throw error;
        }
      }
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
    }
  )
);

export default useAuthStore; 
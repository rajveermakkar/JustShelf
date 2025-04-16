import React, { useState, useEffect } from 'react';
import { FiTrash2, FiEye } from 'react-icons/fi';
import useAuthStore from '../../utils/auth';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ViewDetails from '../../components/ViewDetails';
import DeleteConfirmation from '../../components/DeleteConfirmation';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { fetchWithAuth, isAuthenticated, user } = useAuthStore();
  const [selectedUser, setSelectedUser] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }

    fetchUsers();
  }, [isAuthenticated, user]);

  const fetchUsers = async () => {
    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/admin/users`);
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(error.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    const user = users.find(u => u.id === userId);
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      setLoading(true);
      const response = await fetchWithAuth(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${userToDelete.id}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }

      toast.success('User deleted successfully');
      // Update the users list by removing the deleted user
      setUsers(users.filter(user => user.id !== userToDelete.id));
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Failed to delete user');
    } finally {
      setLoading(false);
      setDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const handleView = async (user) => {
    try {
      // Fetch user details including addresses and orders
      const response = await fetchWithAuth(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${user.id}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }

      const userData = await response.json();
      setSelectedUser(userData);
      setIsViewModalOpen(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to fetch user details');
    }
  };

  const handleUserUpdate = (updatedUser) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    setSelectedUser(updatedUser);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E6A74A]"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Users</h1>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="hidden sm:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {user.first_name} {user.last_name}
                  </div>
                  <div className="sm:hidden text-xs text-gray-500 mt-1 truncate">
                    {user.email}
                  </div>
                </td>
                <td className="hidden sm:table-cell px-4 sm:px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 truncate max-w-[150px] sm:max-w-none">
                    {user.email}
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 sm:px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleView(user)}
                      className="text-[#E6A74A] hover:text-[#d6993a] cursor-pointer"
                    >
                      <FiEye size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-900 cursor-pointer"
                    >
                      <FiTrash2 size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ViewDetails
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        data={selectedUser}
        type="user"
        onUpdate={handleUserUpdate}
      />

      <DeleteConfirmation
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${userToDelete ? `${userToDelete.first_name} ${userToDelete.last_name}` : 'this user'}?`}
        itemName={userToDelete ? `${userToDelete.first_name} ${userToDelete.last_name}` : null}
      />
    </div>
  );
};

export default Users;
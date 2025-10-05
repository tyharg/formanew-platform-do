'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, CardContent, CardHeader, CircularProgress } from '@mui/material';
import PageContainer from '../Common/PageContainer/PageContainer';
import { UsersClient } from '../../lib/api/users';
import { UserWithSubscriptions } from '../../types';
import Toast from 'components/Common/Toast/Toast';
import { USER_ROLES } from '../../lib/auth/roles';
import { useSession } from 'next-auth/react';
import UserTable from './UserTable/UserTable';
import EditUserDialog from './EditUserDialog/EditUserDialog';
import UserFilterControls from './UserFilterControls/UserFilterControls';
import Pagination from '../Common/Pagination/Pagination';

/**
 * Admin dashboard component for managing users, roles, and subscriptions.
 */
export default function AdminDashboard() {
  const [users, setUsers] = useState<UserWithSubscriptions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchName, setSearchName] = useState('');
  const [filterPlan, setFilterPlan] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);

  // Modal state
  const [openEdit, setOpenEdit] = useState(false);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithSubscriptions | null>(null);
  const [editForm, setEditForm] = useState<Partial<UserWithSubscriptions>>({});

  // Toast state
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const session = useSession();

  // Open modal and set form state
  const handleEditClick = (user: UserWithSubscriptions) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      subscription: user.subscription,
    });
    setOpenEdit(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditSubscriptionChange = (e: React.ChangeEvent<HTMLInputElement> | any) => {
    setEditForm(
      (prev) =>
        ({
          ...prev,
          subscription: {
            ...(prev.subscription ?? {}),
            [e.target.name]: e.target.value as string,
          },
        }) as Partial<UserWithSubscriptions>
    );
  };

  const handleEditClose = () => {
    setOpenEdit(false);
    setSelectedUser(null);
    setEditForm({});
  };

  const handleEditButton = async () => {
    if (!selectedUser) return;
    await updateUser(selectedUser.id, {
      name: editForm.name,
      subscription: editForm.subscription,
    });
  };

  const updateUser = async (userId: string, fields: Partial<UserWithSubscriptions>) => {
    if (!userId) return;
    try {
      setIsLoadingEdit(true);
      const api = new UsersClient();
      await api.updateUser(userId, fields);
      // Refresh users
      const data = await api.getUsers();
      setUsers(data.users || []);
      if (session.data?.user?.id === userId) {
        session.update({ user: { name: fields.name } });
      }
      handleEditClose();
      setToast({ open: true, message: 'User updated successfully!', severity: 'success' });
    } catch {
      setToast({ open: true, message: 'Failed to update user', severity: 'error' });
    } finally {
      setIsLoadingEdit(false);
    }
  };

  // Add this function inside your AdminDashboard component
  const handleAdminSwitchChange = async (user: UserWithSubscriptions, checked: boolean) => {
    setSelectedUser(user);
    await updateUser(user.id, { role: checked ? USER_ROLES.ADMIN : USER_ROLES.USER });
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const api = new UsersClient();
        const data = await api.getUsers({
          page,
          pageSize,
          searchName,
          filterPlan,
          filterStatus,
        });
        setUsers(data.users || []);
        setTotalUsers(data.total || 0);
      } catch {
        setError('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [page, pageSize, searchName, filterPlan, filterStatus]);
  return (
    <PageContainer title="Admin Dashboard">
      <CardHeader
        title={
          <Typography variant="h6" fontWeight="bold">
            User Management
          </Typography>
        }
      />
      <CardContent sx={{ pt: 0 }}>
        <UserFilterControls
          searchName={searchName}
          setSearchName={setSearchName}
          filterPlan={filterPlan}
          setFilterPlan={setFilterPlan}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          setPage={setPage}
        />
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={100}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <>
            <UserTable
              users={users}
              selectedUser={selectedUser}
              isLoadingEdit={isLoadingEdit}
              handleAdminSwitchChange={handleAdminSwitchChange}
              handleEditClick={handleEditClick}
            />
            <Pagination
              totalItems={totalUsers}
              pageSize={pageSize}
              setPageSize={setPageSize}
              page={page}
              setPage={setPage}
            />
          </>
        )}
      </CardContent>
      <EditUserDialog
        open={openEdit}
        editForm={editForm}
        isLoadingEdit={isLoadingEdit}
        handleEditChange={handleEditChange}
        handleEditSubscriptionChange={handleEditSubscriptionChange}
        handleEditButton={handleEditButton}
        handleEditClose={handleEditClose}
      />
      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
    </PageContainer>
  );
}

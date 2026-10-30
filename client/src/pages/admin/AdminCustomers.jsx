import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import AdminUserList from '../../components/admin/AdminUserList';
import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader';
import { changeUserStatus, fetchAdminUsers } from '../../slices/adminSlice';

// Customer management. GET /admin/users returns the newest 100 accounts with
// their role and status; deactivating bumps the account's token version, so an
// inactive account is signed out by the backend.
export default function AdminCustomers() {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.admin);
  const currentUserId = useSelector((state) => state.auth.user?._id);

  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    dispatch(fetchAdminUsers());
  }, [dispatch]);

  const handleStatusChange = async (userId, status) => {
    setBusyId(userId);
    setNotice(null);

    try {
      await dispatch(changeUserStatus({ userId, status })).unwrap();
      setNotice({ tone: 'success', text: `Account is now ${status}.` });
    } catch (message) {
      setNotice({ tone: 'error', text: String(message) });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        eyebrow="Accounts"
        title="User directory"
        description="Browse account details and contact users by email or phone. Search and filter the newest 100 accounts by role or status."
      />

      {notice && (
        <p
          role={notice.tone === 'success' ? 'status' : 'alert'}
          className={[
            'rounded-3xl border px-5 py-4 text-sm',
            notice.tone === 'error'
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-peach bg-peach/30 text-primary',
          ].join(' ')}
        >
          {notice.text}
        </p>
      )}

      <AdminUserList
        users={users}
        loading={loading && users.length === 0}
        error={users.length === 0 ? error : null}
        onStatusChange={handleStatusChange}
        busyId={busyId}
        currentUserId={currentUserId}
      />
    </div>
  );
}

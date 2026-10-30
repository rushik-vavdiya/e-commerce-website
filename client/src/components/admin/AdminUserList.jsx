import { useMemo, useState } from 'react';
import { Mail, Phone, Search, UsersRound } from 'lucide-react';

import StatusPill from '../dashboard/StatusPill';
import ProductPagination from '../product/ProductPagination';
import { ADMIN_PAGE_SIZE, clampPage, pageCount, pageSlice } from '../../utils/pagination';
import { formatDate } from '../../utils/format';

const getFullName = (user) =>
  `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Unnamed account';

const getInitials = (user) =>
  `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || 'U';

export default function AdminUserList({
  users = [],
  loading = false,
  error = null,
  onStatusChange,
  busyId = null,
  currentUserId = null,
}) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Any filter change starts the reader back at the first page of results.
  const applySearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const applyRoleFilter = (value) => {
    setRoleFilter(value);
    setPage(1);
  };

  const applyStatusFilter = (value) => {
    setStatusFilter(value);
    setPage(1);
  };

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesQuery =
        !query ||
        [getFullName(user), user.email, user.phone, user._id]
          .some((value) => String(value ?? '').toLowerCase().includes(query));

      return (
        matchesQuery &&
        (roleFilter === 'all' || user.role === roleFilter) &&
        (statusFilter === 'all' || user.status === statusFilter)
      );
    });
  }, [users, search, roleFilter, statusFilter]);

  // This list does its own searching and filtering, so the pager lives here
  // too: it pages the *filtered* rows, not whatever slice of the full account
  // list arrived from the page.
  const pages = pageCount(filteredUsers.length);
  const activePage = clampPage(page, pages);
  const pageRows = pageSlice(filteredUsers, activePage);

  const activeCount = users.filter((user) => user.status === 'active').length;
  const verifiedCount = users.filter((user) => user.emailVerified).length;

  if (loading) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true">
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className="h-16 animate-pulse rounded-2xl border border-border bg-white/60"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p role="alert" className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
        {error}
      </p>
    );
  }

  if (users.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-white px-5 py-10 text-center text-sm text-muted">
        No accounts found.
      </p>
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-white">
      <div className="grid gap-px border-b border-border bg-border sm:grid-cols-3">
        <div className="bg-white px-5 py-4">
          <p className="text-xs font-medium text-muted">Accounts loaded</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-primary">{users.length}</p>
        </div>
        <div className="bg-white px-5 py-4">
          <p className="text-xs font-medium text-muted">Active accounts</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-primary">{activeCount}</p>
        </div>
        <div className="bg-white px-5 py-4">
          <p className="text-xs font-medium text-muted">Verified emails</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-primary">{verifiedCount}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:p-5">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search accounts</span>
          <Search
            size={17}
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => applySearch(event.target.value)}
            placeholder="Search name, email, phone or ID"
            className="min-h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
          />
        </label>

        <div className="grid grid-cols-2 gap-3 sm:flex">
          <label className="sr-only" htmlFor="admin-user-role-filter">
            Filter accounts by role
          </label>
          <select
            id="admin-user-role-filter"
            value={roleFilter}
            onChange={(event) => applyRoleFilter(event.target.value)}
            className="min-h-11 rounded-xl border border-border bg-white px-3 text-sm text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
          >
            <option value="all">All roles</option>
            <option value="customer">Customers</option>
            <option value="vendor">Vendors</option>
            <option value="admin">Admins</option>
          </select>

          <label className="sr-only" htmlFor="admin-user-status-filter">
            Filter accounts by status
          </label>
          <select
            id="admin-user-status-filter"
            value={statusFilter}
            onChange={(event) => applyStatusFilter(event.target.value)}
            className="min-h-11 rounded-xl border border-border bg-white px-3 text-sm text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-5 py-3">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <UsersRound size={17} className="text-accent" aria-hidden="true" />
          User directory
        </div>
        <p className="text-xs text-muted" aria-live="polite">
          Showing {filteredUsers.length} of {users.length}
        </p>
      </div>

      {filteredUsers.length === 0 ? (
        <p className="border-t border-border px-5 py-12 text-center text-sm text-muted">
          No accounts match those search or filter options.
        </p>
      ) : (
        <div className="overflow-x-auto border-t border-border">
          {/* table-fixed with a width per column: the account table has eight
              columns and auto layout was handing the widest one all the room, which
              squeezed the email cell until it broke mid-word and pushed the Action
              button off the right edge. */}
          <table className="w-full min-w-[980px] table-fixed text-left text-sm">
            <caption className="sr-only">Admin user directory and contact details</caption>
            <thead className="bg-background">
              <tr className="border-b border-border text-[11px] uppercase tracking-[0.14em] text-muted">
                <th scope="col" className="w-[20%] px-4 py-3 font-semibold">User</th>
                <th scope="col" className="w-[24%] px-4 py-3 font-semibold">Email address</th>
                <th scope="col" className="w-[12%] px-4 py-3 font-semibold">Phone number</th>
                <th scope="col" className="w-[9%] px-4 py-3 font-semibold">Role</th>
                <th scope="col" className="w-[10%] px-4 py-3 font-semibold">Email status</th>
                <th scope="col" className="w-[9%] px-4 py-3 font-semibold">Date joined</th>
                <th scope="col" className="w-[7%] px-4 py-3 font-semibold">Account</th>
                <th scope="col" className="w-[9%] px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {pageRows.map((user) => {
                const busy = busyId === user._id;
                const isSelf = currentUserId && String(currentUserId) === String(user._id);
                const nextStatus = user.status === 'active' ? 'inactive' : 'active';

                return (
                  <tr key={user._id} className="transition-colors hover:bg-background/70">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {user.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt=""
                            className="size-10 shrink-0 rounded-full border border-border object-cover"
                          />
                        ) : (
                          <span
                            aria-hidden="true"
                            className="grid size-10 shrink-0 place-items-center rounded-full bg-peach/50 text-xs font-semibold text-primary"
                          >
                            {getInitials(user)}
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-medium text-primary">{getFullName(user)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {user.email ? (
                        <a
                          href={`mailto:${user.email}`}
                          title={user.email}
                          className="flex min-w-0 items-center gap-2 text-muted transition-colors hover:text-accent"
                        >
                          <Mail size={15} className="shrink-0" aria-hidden="true" />
                          {/* One clipped line: a long address used to run
                              under the phone column because a flex item never
                              shrinks below its longest word. */}
                          <span className="truncate">{user.email}</span>
                        </a>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      {user.phone ? (
                        <a
                          href={`tel:${user.phone}`}
                          className="inline-flex items-center gap-2 text-muted transition-colors hover:text-accent"
                        >
                          <Phone size={15} className="shrink-0" aria-hidden="true" />
                          {user.phone}
                        </a>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <StatusPill value={user.role} tone="accent" />
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={[
                          'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
                          user.emailVerified
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700',
                        ].join(' ')}
                      >
                        {user.emailVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-xs text-muted">
                      {formatDate(user.createdAt) || '—'}
                    </td>
                    <td className="px-4 py-4">
                      <StatusPill value={user.status} />
                    </td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        disabled={busy || Boolean(isSelf)}
                        title={
                          isSelf
                            ? 'The API does not allow an admin to deactivate their own account'
                            : undefined
                        }
                        onClick={() => onStatusChange?.(user._id, nextStatus)}
                        className="inline-flex min-h-9 items-center justify-center whitespace-nowrap rounded-full border border-border px-3 text-xs font-medium text-primary transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        {busy ? 'Saving…' : user.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>            </table>
          </div>
        )}

      <ProductPagination
        label="Account pages"
        page={activePage}
        pages={pages}
        total={filteredUsers.length}
        limit={ADMIN_PAGE_SIZE}
        onPageChange={setPage}
        className="border-t border-border px-5 py-4"
      />
    </section>
  );
}

# Reusable Data Display Components

This directory contains reusable components for displaying data in tables and grids with pagination, view switching, and more.

## Components

### 1. DataView (Main Component)
The main component that combines table/grid views with a view switcher.

```tsx
import { DataView, Column } from '@/components/data-display';

const columns: Column<User>[] = [
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
  {
    key: 'status',
    header: 'Status',
    render: (user) => <Badge>{user.status}</Badge>
  },
];

<DataView
  data={users}
  columns={columns}
  renderGridItem={(user) => <UserCard user={user} />}
  isLoading={isLoading}
  error={error}
  pagination={{
    currentPage: 1,
    totalPages: 10,
    onPageChange: (page) => setPage(page)
  }}
  defaultView="table"
  gridCols={3}
  showViewSwitcher={true}
/>
```

### 2. DataTable
Standalone table component with pagination.

```tsx
import { DataTable, Column } from '@/components/data-display';

<DataTable
  data={users}
  columns={columns}
  isLoading={isLoading}
  error={error}
  emptyMessage="No users found"
  pagination={{
    currentPage: 1,
    totalPages: 10,
    onPageChange: (page) => setPage(page)
  }}
/>
```

### 3. DataGrid
Standalone grid component with pagination.

```tsx
import { DataGrid } from '@/components/data-display';

<DataGrid
  data={users}
  renderItem={(user) => <UserCard user={user} />}
  isLoading={isLoading}
  error={error}
  gridCols={3}
  pagination={{
    currentPage: 1,
    totalPages: 10,
    onPageChange: (page) => setPage(page)
  }}
/>
```

### 4. ViewSwitcher
Toggle between table and grid views.

```tsx
import { ViewSwitcher } from '@/components/data-display';

<ViewSwitcher
  view={view}
  onViewChange={setView}
/>
```

### 5. DataPagination
Pagination component.

```tsx
import { DataPagination } from '@/components/data-display';

<DataPagination
  currentPage={1}
  totalPages={10}
  onPageChange={(page) => setPage(page)}
/>
```

## Column Definition

```tsx
interface Column<T> {
  key: keyof T | string;        // Field key or custom key
  header: string;               // Column header text
  render?: (item: T) => React.ReactNode;  // Custom render function
  className?: string;            // Additional CSS classes
}
```

## Example Usage

See `app/(main)/users/page.tsx` for a complete example.

## Features

- ✅ Table and Grid views
- ✅ View switcher (Table/Grid toggle)
- ✅ Built-in pagination
- ✅ Loading states
- ✅ Error handling with alerts
- ✅ Empty states
- ✅ Fully typed with TypeScript
- ✅ Responsive design
- ✅ Reusable across all pages


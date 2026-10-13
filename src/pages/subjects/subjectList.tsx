
import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useTable } from '@refinedev/react-table';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb';
import { ListView } from '@/components/refine-ui/views/list-view';
import { CreateButton } from '@/components/refine-ui/buttons/create';
import { DataTable } from '@/components/refine-ui/data-table/data-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DepartmentOptions } from '@/constants';
import { Subject } from '@/types';
import { ColumnDef } from '@tanstack/react-table';



const SubjectList = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('all');

    const departmentFilters = selectedDepartment === 'all' ? [] :[{ field: 'department', operator:'eq' as const, value: selectedDepartment}];
   const searchfilters = searchQuery ? [{field: 'name', operator: 'contains' as const, value: searchQuery}]: [];
    const subjectTable = useTable<Subject>({
        columns: useMemo<ColumnDef<Subject>[]>(() => [
            {
                id: 'code',
                accessorKey: 'code',
                size: 100,
                header: () => <p>Code</p>,
                cell: ({getValue}) => <Badge variant={'secondary'}>{getValue<string>()}</Badge>
            },
            
              {
    id: 'name',
    accessorKey: 'name',
    size: 240,
    header: () => <span className="font-semibold">Name</span>,
    cell: ({ getValue }) => <span className="font-medium text-foreground">{getValue<string>()}</span>,
  },
  {
    id: 'department.name',
    accessorKey: 'department', // already a plain string after toSubject
    size: 200,
    header: () => <span className="font-semibold">Department</span>,
    cell: ({ getValue }) => <Badge variant="secondary">{getValue<string>()}</Badge>,
  },
    {
    id: 'description',
    accessorKey: 'description',
    size: 320,
    header: () => <span className="font-semibold">Description</span>,
    cell: ({ getValue }) => (
      <span className="line-clamp-2 truncate text-sm text-muted-foreground">{getValue<string>()}</span>
    ),
  },

        ], []),
        refineCoreProps:{
            resource: 'subjects',
            pagination: {pageSize: 10, mode: 'server'},
            filters: {
                permanent: [...departmentFilters, ...searchfilters]
            },
            sorters: {
                initial: [
                    {field: 'id', order: 'desc'}
                ]
            }
        }
    });

  return (
    <ListView>
      <Breadcrumb />

      {/* Page header */}
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Subjects</h1>
          <p className="text-sm text-muted-foreground">
            Quick access to essential metrics and management tools
          </p>
        </div>
        <CreateButton />
      </div>

      {/* Toolbar: search + department filter */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Filter by department..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {DepartmentOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="mt-4">
        <DataTable table={subjectTable} />
      </div>
    </ListView>
  )
}


export default SubjectList
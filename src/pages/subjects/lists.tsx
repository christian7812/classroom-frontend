import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb';
import { ListView } from '@/components/refine-ui/views/list-view';
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from '@/components/ui/select';
import { DepartmentOptions } from '@/constants';
import { CreateButton } from '@/components/refine-ui/buttons/create';
import { DataTable } from '@/components/refine-ui/data-table/data-table';
import { useTable } from '@refinedev/react-table';
import { Subject } from '@/types';
import { ColumnDef } from '@tanstack/table-core';


const SubjectList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

const departmentFilter = selectedDepartment !== 'all' ? [{ field: 'department', operator: 'eq' as const, value: selectedDepartment }] : [];
const searchFilter = searchQuery ? [{ field: 'name', operator: 'contains' as const, value: searchQuery }] : [];

  const subjectTable = useTable<Subject>({
    columns: useMemo<ColumnDef<Subject>[]>(()=> [
        {id: 'code',
        accessorKey: 'code',
         header: () => <p className="font-bold ml-2">Code</p>,
         size: 100, 
         cell: ({getValue}) => <Badge className="ml-2">{getValue<string>()}</Badge>
        },
        {
id: 'name',
accessorKey: 'name',
header: () => <p className="font-bold">Name</p>,
size: 200,
cell: ({getValue}) => <span className="text-foreground">{getValue<string>()}</span>,
filterFn: 'includesString',
        },

        {
            id:'department',
            accessorKey: 'department',
            header: () => <p className="font-bold">Department</p>,
            size: 200,
            cell: ( {getValue} ) => <Badge variant="secondary" className="text-foreground">
                {getValue<string>()}
            </Badge>,
        },
        {
            id: 'description',
            accessorKey: 'description',
            header: () => <p className="font-bold">Description</p>,
            size: 300,
            cell: ({getValue}) => <span className="truncate line-clamp-2">{getValue<string>()}</span>
        }
    ],
     []),
    refineCoreProps: {
      resource: 'subjects',
      pagination: { pageSize: 10, mode: 'server' },
      filters: {
        permanent: [...departmentFilter, ...searchFilter]
      },
    sorters: {
        initial: [
            {
                field: 'id',
                order: 'desc'
            }
        ]
    },
    }
  })
  return (
    <ListView>
      <Breadcrumb />

      <h1 className="font-bold text-2xl">Subjects</h1>

      <div className="flex flex-col gap-4">
        <p>Quick access to essential metrics and management tools</p>

        <div className="relative max-w-sm">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name..."
            className="w-full rounded-md border bg-background py-2 pl-8 pr-3 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="flex gap-2 w-full sm:w-auto">
  <Select value={selectedDepartment} onValueChange={setSelectedDepartment} >
    <SelectTrigger>
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
  <CreateButton />
          </div>
        </div>
      </div>

      <DataTable table={subjectTable} />
    </ListView>
  );
};

export default SubjectList;
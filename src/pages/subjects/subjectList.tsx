import { CreateButton } from "@/components/refine-ui/buttons/create";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { ListView } from "@/components/refine-ui/views/list-view";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Departments_Options } from "@/constants";
import type { Subject } from "@/types";
import { useTable } from "@refinedev/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

const SubjectList = () => {
  const [search, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  const departmentFilters =
    selectedDepartment === "all"
      ? []
      : [
          {
            field: "department",
            operator: "eq" as const,
            value: selectedDepartment,
          },
        ];

  const searchFilters = search
    ? [{ field: "name", operator: "contains" as const, value: search }]
    : [];

  const subjectTable = useTable<Subject>({
    columns: useMemo<ColumnDef<Subject>[]>(
      () => [
        {
          id: "code",
          accessorKey: "code",
          size: 100,
          header: () => (
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Course code
            </span>
          ),
          cell: ({ getValue }) => (
            <Badge
              variant="outline"
              className="rounded-md border-primary/20 bg-primary/5 font-mono text-primary"
            >
              {getValue<string>()}
            </Badge>
          ),
        },
        {
          id: "name",
          accessorKey: "name",
          size: 180,
          header: () => (
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Subject
            </span>
          ),
          cell: ({ getValue }) => (
            <span className="font-medium text-foreground">
              {getValue<string>()}
            </span>
          ),
          filterFn: "includesString",
        },
        {
          id: "department",
          accessorKey: "department",
          size: 150,
          header: () => (
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Department
            </span>
          ),
          cell: ({ getValue }) => (
            <Badge
              variant="secondary"
              className="rounded-full px-2.5 font-medium"
            >
              {getValue<string>()}
            </Badge>
          ),
        },
        {
          id: "description",
          accessorKey: "description",
          size: 300,
          header: () => (
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Description
            </span>
          ),
          cell: ({ getValue }) => (
            <span className="block line-clamp-2 whitespace-normal text-sm leading-5 text-muted-foreground">
              {getValue<string>()}
            </span>
          ),
        },
      ],
      [],
    ),
    refineCoreProps: {
      resource: "subjects",
      pagination: { pageSize: 10, mode: "server" },
      filters: {
        permanent: [...departmentFilters, ...searchFilters],
      },
      sorters: {
        initial: [{ field: "id", order: "desc" }],
      },
    },
  });

  return (
    <ListView className="gap-6">
      <Breadcrumb />

      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium text-primary">Course catalog</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Subjects
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          Browse and manage university courses by name, course code, or
          department.
        </p>
      </header>

      <section
        aria-label="Subject filters"
        className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="relative w-full sm:max-w-sm">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            aria-label="Search subjects by name"
            placeholder="Search subjects..."
            value={search}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="h-10 rounded-lg bg-background pl-9"
          />
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <Select
            value={selectedDepartment}
            onValueChange={setSelectedDepartment}
          >
            <SelectTrigger
              aria-label="Filter by department"
              className="h-10 w-full rounded-lg bg-background sm:w-[200px]"
            >
              <SelectValue placeholder="Filter by department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {Departments_Options.map((department) => (
                <SelectItem key={department.value} value={department.value}>
                  {department.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <CreateButton className="h-10 rounded-lg px-4 shadow-sm" />
        </div>
      </section>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm [&>div:first-child]:border-0 [&>div:first-child]:rounded-none">
        <DataTable table={subjectTable} />
      </div>
    </ListView>
  );
};

export default SubjectList;

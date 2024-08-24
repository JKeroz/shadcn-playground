import "@tanstack/react-table";
import { QueryParamFilter } from "@/lib/validation/data-table-query-params"
import { ColumnFiltersState } from "@tanstack/react-table";
declare module "@tanstack/react-table" {
  interface ColumnMeta {
    isUtilityColumn?: boolean;
  }
  interface TableState { 
    columnFilters: ColumnFiltersState | QueryParamFilter[]
  }
}
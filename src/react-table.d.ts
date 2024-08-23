import "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface ColumnMeta {
    isUtilityColumn?: boolean;
  }
  interface TableState {
    columnFilters: QueryParamFilter[];
  }
}
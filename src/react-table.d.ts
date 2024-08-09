import "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface ColumnMeta {
    isUtilityColumn?: boolean;
    headerClassName?: string;
    cellClassName?: string;
  }
}
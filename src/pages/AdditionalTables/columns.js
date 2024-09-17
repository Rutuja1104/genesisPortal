import { createColumnHelper } from "@tanstack/react-table";
import TableCell from "./TableCell";
import EditCell from "./EditCell";

const columnHelper = createColumnHelper();

const AddColumns = (networkData) => {
  const columns = [
    columnHelper.accessor("title", {
      header: <div className="Title-header">Title</div>,
      cell: TableCell,
      meta: {
        type: "text",
        required: true,
      },
    }),
    columnHelper.accessor("key", {
      header: "Key",
      cell: TableCell,
      meta: {
        type: "text",
        required: true,
      },
    }),
    columnHelper.accessor("type", {
      header: "type",
      cell: TableCell,
      meta: {
        type: "text",
        required: true,
      },
    }),
    columnHelper.accessor("justification", {
      header: "Justification",
      cell: TableCell,
      meta: {
        type: "text",
        required: true,
      },
    }),
    columnHelper.accessor("required", {
      header: "Required",
      cell: TableCell,
      meta: {
        type: "checkbox",
      },
    }),
    columnHelper.accessor("displyed", {
      header: "Displyed",
      cell: TableCell,
      meta: {
        type: "checkbox",
      },
    }),
    columnHelper.accessor("sensitive", {
      header: "Sensitive",
      cell: TableCell,
      meta: {
        type: "checkbox",
      },
    }),
    columnHelper.display({
      id: "edit",
      cell: EditCell,
    }),
  ];

  return columns;
};

export { AddColumns };

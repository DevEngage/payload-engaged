import { ColumnDef, Row } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import { Badge } from "../badge";
import { Button } from "../button";
import { Checkbox } from "../checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu";

type ColumnType =
  | "text"
  | "date"
  | "number"
  | "boolean"
  | "image"
  | "video"
  | "audio"
  | "url"
  | "email"
  | "reference";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat("en-US").format(value);
};

const formatDate = (value: string) => {
  return new Date(value).toLocaleDateString();
};

export const buildColumns = (
  columns: any[],
  options: {
    forcedTypes: { [key: string]: ColumnType };
    onAction?: (row: any) => void;
    linkComponent?: any;
    viewLink?: string;
  },
) => {
  const { forcedTypes, onAction, linkComponent, viewLink } = options;
  const LinkComponent = linkComponent ?? "a";
  const built: ColumnDef<any>[] = columns.map((column) => {
    return {
      header: column.header,
      accessorKey: column.accessorKey,
      type: column.type,
      visible: column.visible,
      cell: ({ row }) => {
        const value = row.getValue(column.accessorKey) as string | undefined;
        const type = forcedTypes[column.accessorKey] || column.type;
        if (type === "boolean") {
          return <Checkbox checked={row.getValue(column.accessorKey)} />;
        } else if (
          type === "image" ||
          column.header === "mediaUrl" ||
          column.header === "media_url"
        ) {
          if (!value)
            return <div className="h-12 w-12 rounded-md bg-gray-200" />;

          return <img src={value} className="h-12 w-12 rounded-md" />;
        } else if (type === "url") {
          return (
            <a href={row.getValue(column.accessorKey)} target="_blank">
              {row.getValue(column.accessorKey)}
            </a>
          );
        } else if (type === "email") {
          return (
            <a href={`mailto:${row.getValue(column.accessorKey)}`}>
              {row.getValue(column.accessorKey)}
            </a>
          );
        } else if (type === "status") {
          return (
            <div className="capitalize">{row.getValue(column.accessorKey)}</div>
          );
        } else if (column.header === "name" || column.header === "title") {
          return (
            <LinkComponent
              className="capitalize"
              href={`${viewLink}/${row.getValue("id")}`}
            >
              {row.getValue(column.accessorKey)}
            </LinkComponent>
          );
        } else if (
          typeof value === "string" &&
          (value.includes("tag") || value.includes("category"))
        ) {
          return <Badge>{value}</Badge>;
        } else if (type === "number") {
          return <div>{formatNumber(Number(value))}</div>;
        } else if (type === "date") {
          return <div>{formatDate(value as string)}</div>;
        } else if (type === "currency") {
          return <div>{formatCurrency(Number(value))}</div>;
        } else if (typeof value === "object") {
          return <div>{JSON.stringify(value)}</div>;
        } else {
          if (value?.length && value.length > 20) {
            return <div>{value.slice(0, 20) + "..."}</div>;
          }
          return <div>{value ?? "-"}</div>;
        }
      },
    };
  });

  built.unshift({
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  });

  built.push({
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      // const payment = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            {/* <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.id)}
            >
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator /> */}
            <DropdownMenuItem onClick={() => onAction?.(row.original)}>
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction?.(row.original)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction?.(row.original)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  });

  return built;
};

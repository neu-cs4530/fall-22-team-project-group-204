/* eslint-disable @typescript-eslint/no-explicit-any */
import { Table, TableContainer, Tbody, Td, Tfoot, Th, Thead, Tr } from '@chakra-ui/react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import * as React from 'react';

export type DataTableProps<Data extends object> = {
  data: Data[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<Data, any>[];
};

export function DataTable<Data extends object>({ data, columns }: DataTableProps<Data>) {
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <TableContainer overflowY='scroll'>
      <Table variant='striped' colorScheme='blackAlpha' size='lg'>
        <Thead>
          {table.getHeaderGroups().map(headerGroup => (
            <Tr key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                return (
                  <Th key={header.id} onClick={header.column.getToggleSortingHandler()}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </Th>
                );
              })}
            </Tr>
          ))}
        </Thead>
        <Tbody>
          {table.getRowModel().rows.map(row => (
            <Tr key={row.id}>
              {row.getVisibleCells().map(cell => {
                return (
                  <Td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</Td>
                );
              })}
            </Tr>
          ))}
        </Tbody>
        <Tfoot>
          {table.getHeaderGroups().map(headerGroup => (
            <Tr key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                return (
                  <Th key={header.id} onClick={header.column.getToggleSortingHandler()}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </Th>
                );
              })}
            </Tr>
          ))}
        </Tfoot>
      </Table>
    </TableContainer>
  );
}

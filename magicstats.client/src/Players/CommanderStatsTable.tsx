import {Table} from "@radix-ui/themes";
import {CommanderStats} from "./PlayerApi.ts";
import SortableHeader from "../Shared/SortableHeader.tsx";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    TableState,
    useReactTable
} from "@tanstack/react-table";
import {useImmer} from "use-immer";

type CommanderStatsTableProps = {
    stats: CommanderStats[],
}

export function CommanderStatsTable({stats}: CommanderStatsTableProps) {
    const table = useReactTable({
        data: stats,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        initialState: {
            sorting: [
                {
                    id: 'games',
                    desc: true,
                }
            ],
        },
    })
    const [tableState, setTableState] = useImmer<TableState>({
        ...table.initialState,
    });

    table.setOptions((prev) => {
        return {
            ...prev,
            state: tableState,
            onStateChange: setTableState,
        };
    });

    return (
        <Table.Root variant='ghost'>
            <Table.Header>
                {table.getHeaderGroups().map(headerGroup => (
                    <Table.Row key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                            <Table.RowHeaderCell key={header.id}>
                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                            </Table.RowHeaderCell>
                        ))}
                    </Table.Row>))}
            </Table.Header>
            <Table.Body>
                {table.getRowModel().rows.map(row => (
                    <Table.Row key={row.id}>
                        {row.getVisibleCells().map(cell => (
                            <Table.Cell key={cell.id} align='center'>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </Table.Cell>))}
                    </Table.Row>
                ))}
            </Table.Body>
        </Table.Root>
    );
}

const columnHelper = createColumnHelper<CommanderStats>();

const columns = [
    columnHelper.accessor('name', {
        id: 'name',
        header: ctx => <SortableHeader text='Name' context={ctx}/>,
    }),
    columnHelper.accessor('games', {
        id: 'games',
        header: ctx => <SortableHeader text='Games' context={ctx}/>,
    }),
    columnHelper.accessor('winrate', {
        id: 'winrate',
        header: ctx => <SortableHeader text={'Winrate'} context={ctx}/>,
        cell: props => toPercentage(props.row.original.winrate),
    }),
];

function toPercentage(num: number): string {
    return (100 * num).toFixed(0) + '%'
}

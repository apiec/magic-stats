import {Link as RouterLink} from "react-router-dom";
import {Link, Table} from "@radix-ui/themes";
import SortableHeader from "../Shared/SortableHeader.tsx";
import {
    CellContext,
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    TableState,
    useReactTable
} from "@tanstack/react-table";
import {useImmer} from "use-immer";
import {Pod} from "./PlayerApi.ts";

type PlayerPodsTableProps = {
    pods: Pod[],
}

export function PlayerPodsTable({pods}: PlayerPodsTableProps) {
    const table = useReactTable({
        data: pods,
        columns: columns,
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
                            <Table.ColumnHeaderCell key={header.id} align='center'>
                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                            </Table.ColumnHeaderCell>
                        ))}
                    </Table.Row>
                ))
                }
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

const columnHelper = createColumnHelper<Pod>();

const columns = [
    columnHelper.accessor('games', {
        id: 'games',
        header: ctx => <SortableHeader text='Games' context={ctx}/>,
    }),
    columnHelper.display({
        id: 'players',
        header: 'Players',
        cell: ctx => <PodLink ctx={ctx}/>
    }),
];

type PodLinkProps = {
    ctx: CellContext<Pod, unknown>
}

function PodLink({ctx}: PodLinkProps) {
    const playerNames = ctx.row.original.players.map(p => p.name).sort().join(', ');
    const queryParams = new URLSearchParams();
    ctx.row.original.players.forEach(p => queryParams.append('playerIds', p.id.toString()));
    return (
        <Link asChild>
            <RouterLink to={"/players" + '?' + queryParams.toString()}>{playerNames}</RouterLink>
        </Link>
    );
}

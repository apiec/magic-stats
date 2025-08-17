import {Table} from "@radix-ui/themes";
import {format} from "date-fns";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    TableState,
    useReactTable
} from "@tanstack/react-table";
import {useImmer} from "use-immer";
import {Commander} from "../Commanders/CommanderApi.ts";
import {RecentGame} from "./PlayerApi.ts";

type PlayerRecentGamesTableProps = {
    games: RecentGame[],
}

type RecentGameRow = {
    gameId: string,
    playedAt: string,
    placement: number,
    commander: Commander,
}

export function PlayerRecentGamesTable({games}: PlayerRecentGamesTableProps) {
    const table = useReactTable({
        data: games
            .sort((a, b) => b.playedAt.getTime() - a.playedAt.getTime())
            .map(g => {
                return {
                    ...g,
                    playedAt: format(g.playedAt, "dd/MM/yyyy"),
                } as RecentGameRow;
            }),
        columns,
        getCoreRowModel: getCoreRowModel(),
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
                            <Table.RowHeaderCell key={header.id} align='center'>
                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                            </Table.RowHeaderCell>
                        ))}
                    </Table.Row>))}
            </Table.Header>
            <Table.Body>
                {table.getRowModel().rows.map(row => (
                    <Table.Row key={row.id}
                               style={row.original.placement === 0 ? {background: 'var(--grass-4)',} : {}}>
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

const columnHelper = createColumnHelper<RecentGameRow>();

const columns = [
    // todo: link to game screen
    columnHelper.accessor('playedAt', {
        id: 'playedAt',
        header: 'Date',
    }),
    columnHelper.accessor('commander.name', {
        id: 'commanderName',
        header: 'Commander',
    }),
    columnHelper.accessor('placement', {
        id: 'placement',
        header: 'Placed',
        cell: props => props.row.original.placement + 1,
    }),
];
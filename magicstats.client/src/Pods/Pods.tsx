import {
    CellContext,
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    TableState,
    useReactTable
} from "@tanstack/react-table";
import PodApi, {Pod} from "./PodApi.ts";
import SortableHeader from "../Shared/SortableHeader.tsx";
import {useImmer} from "use-immer";
import {useEffect, useState} from "react";
import {Link as RouterLink} from "react-router-dom";
import {Link, Text, Table, Container, Spinner} from "@radix-ui/themes";

export default function Pods() {
    const [pods, setPods] = useState<Pod[] | undefined>(undefined)

    useEffect(() => {
        populatePodsData().then();
    }, []);

    async function populatePodsData() {
        const api = new PodApi();
        const data = await api.getAll()
        setPods(data);
    }

    if (pods === undefined) {
        return (
            <Spinner/>
        );
    }

    return (
        <Container maxWidth='700px'>
            <PodsTable pods={pods}/>
        </Container>
    );
}

type PodsTableProps = {
    pods: Pod[],
}

function PodsTable({pods}: PodsTableProps) {
    const table = useReactTable({
        data: pods,
        columns: columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        initialState: {
            sorting: [
                {
                    id: 'size',
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
        <Table.Root size='1' variant='surface'>
            <Table.Header>
                {table.getHeaderGroups().map(headerGroup => (
                    <Table.Row key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                            <Table.ColumnHeaderCell key={header.id}>
                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                            </Table.ColumnHeaderCell>
                        ))}
                    </Table.Row>
                ))
                }
            </Table.Header>
            <Table.Body>
                {table.getRowModel().rows.map(row => (
                    <Table.Row key={row.id} align='center'>
                        {row.getVisibleCells().map(cell => (
                            <Table.Cell key={cell.id}>
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
    columnHelper.accessor('size', {
        id: 'size',
        header: ctx => <SortableHeader text='Size' context={ctx}/>,
        cell: ctx => <Text weight='bold'>{ctx.getValue()}</Text>
    }),
    columnHelper.display({
        id: 'players',
        header: 'Players',
        cell: ctx => <PodLink ctx={ctx}/>
    }),
    columnHelper.accessor('games', {
        id: 'games',
        header: ctx => <SortableHeader text='Games' context={ctx}/>,
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

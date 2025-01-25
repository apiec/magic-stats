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
import {Link} from "react-router-dom";

export default function Pods() {
    const [pods, setPods] = useState<Pod[]>([])
    useEffect(() => {
        populatePodsData().then();
    }, []);

    async function populatePodsData() {
        const api = new PodApi();
        const data = await api.getAll()
        setPods(data);
    }

    return (
        <section className='pods-section'>
            <PodsTable pods={pods}/>
        </section>
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
        <table className='pods-table'>
            <thead>
            {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                        <th key={header.id}>
                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                    ))}
                </tr>
            ))
            }
            </thead>
            <tbody>
            {table.getRowModel().rows.map(row => (
                <tr key={row.id}>
                    {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>))}
                </tr>
            ))}
            </tbody>
        </table>
    );
}

const columnHelper = createColumnHelper<Pod>();

const columns = [
    columnHelper.accessor('size', {
        id: 'size',
        header: ctx => <SortableHeader text='Size' context={ctx}/>,
        cell: ctx => <p className='size-cell'>{ctx.getValue()}</p>
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
        <Link to={"/players" + '?' + queryParams.toString()}>{playerNames}</Link>
    );
}

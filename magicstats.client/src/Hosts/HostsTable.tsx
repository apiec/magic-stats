import HostApi, {HostWithStats} from "./HostApi.ts";
import SortableHeader from "../Shared/SortableHeader.tsx";
import {useImmer} from "use-immer";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    TableState,
    useReactTable
} from "@tanstack/react-table";
import {FaTrash} from "react-icons/fa";

type HostTableProps = {
    hosts: HostWithStats[],
}
export default function HostsTable({hosts}: HostTableProps) {
    const table = useReactTable({
        data: hosts,
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
        <section className='hosts-section'>
            <table className='hosts-table'>
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
        </section>
    );
}

const columnHelper = createColumnHelper<HostWithStats>();

const columns = [
    columnHelper.accessor('name', {
        id: 'name',
        header: ctx => <SortableHeader text='Name' context={ctx}/>,
    }),
    columnHelper.accessor('irl', {
        id: 'irl',
        header: ctx => <SortableHeader text='Is IRL' context={ctx}/>,
        cell: ctx => ctx.row.original.irl ? 'IRL' : 'online',
    }),
    columnHelper.accessor('games', {
        id: 'games',
        header: ctx => <SortableHeader text='Games' context={ctx}/>,
    }),
    columnHelper.display({
        id: 'delete',
        header: 'Delete',
        cell: props => <DeleteHostButton hostId={props.row.original.id}/>,
    })
];

type DeleteHostButtonProps = {
    hostId: string,
}

function DeleteHostButton({hostId}: DeleteHostButtonProps) {
    return (
        <FaTrash className='button-like' onClick={(e) => {
            e.stopPropagation();
            const api = new HostApi();
            api.delete(hostId)
                .then(() => window.location.reload());
        }}/>
    );
}
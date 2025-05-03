import CommanderApi, {CommanderWithStats} from "./CommanderApi.ts";
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

type CommanderTableProps = {
    commanders: CommanderWithStats[],
    lastXWindowSize: number,
}
export default function CommandersTable({commanders}: CommanderTableProps) {
    const table = useReactTable({
        data: commanders,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        initialState: {
            sorting: [
                {
                    id: 'stats.winrate',
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
        <table className='commanders-table'>
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

const columnHelper = createColumnHelper<CommanderWithStats>();

const columns = [
    columnHelper.accessor('name', {
        id: 'name',
        header: ctx => <SortableHeader text='Name' context={ctx}/>,
    }),
    columnHelper.accessor('stats.games', {
        id: 'games',
        header: ctx => <SortableHeader text='Games' context={ctx}/>,
    }),
    columnHelper.accessor('stats.wins', {
        id: 'wins',
        header: ctx => <SortableHeader text='Wins' context={ctx}/>,
    }),
    columnHelper.accessor('stats.winrate', {
        id: 'winrate',
        header: ctx => <SortableHeader text='WR%' context={ctx}/>,
        cell: props => toPercentage(props.row.original.stats.winrate)
    }),
    columnHelper.accessor('stats.winrateLastX', {
        id: 'winrateLastX',
        header: ctx => <SortableHeader text='WRLX' context={ctx}/>,
        cell: props => toPercentage(props.row.original.stats.winrateLastX)
    }),
    columnHelper.display({
        id: 'delete',
        header: 'Delete',
        cell: props => <DeleteCommanderButton commanderId={props.row.original.id}/>,
    })
];

type DeleteCommanderButtonProps = {
    commanderId: string,
}

function DeleteCommanderButton({commanderId}: DeleteCommanderButtonProps) {
    return (
        <FaTrash className='button-like' onClick={(e) => {
            e.stopPropagation();
            const api = new CommanderApi();
            api.delete(commanderId)
                .then(() => window.location.reload());
        }}/>
    );
}

function toPercentage(num: number): string {
    return (100 * num).toFixed(0);
}
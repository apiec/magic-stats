import './GameTab.css';
import {
    ColumnDef,
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable
} from "@tanstack/react-table";
import {Game, Participant} from "../Games.tsx";

interface GameTabProps {
    game: Game,
}

export function GameTab({game}: GameTabProps) {
    const data = game.participants;
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        initialState: {
            sorting: [
                {
                    id: 'placement',
                    desc: false,
                }
            ]
        }
    })
    return (
        <table className='game-tab-table'>
            <thead>
            {
                table.getHeaderGroups().map(headerGroup => (
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
                <tr>
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

const columnHelper = createColumnHelper<Participant>();
const columns: ColumnDef<Participant, any>[] = [
    columnHelper.accessor('player.name', {id: 'playerName', header: 'Player'}),
    columnHelper.accessor('commander.name', {id: 'commanderName', header: 'Commander'}),
    columnHelper.accessor('placement', {id: 'placement', header: 'Placement'}),
    columnHelper.accessor('startingOrder', {id: 'startingOrder', header: 'Started'}),
];
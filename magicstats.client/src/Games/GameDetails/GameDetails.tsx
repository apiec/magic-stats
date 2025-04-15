import './GameDetails.css';
import {
    ColumnDef,
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable
} from "@tanstack/react-table";
import {format} from 'date-fns';
import {Game, Participant} from "../GamesApi.ts";

interface GameDetailsProps {
    game: Game,
}

export function GameDetails({game}: GameDetailsProps) {
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
        <div className='game-details'>
            <section className='game-details-header'>
                <div>{game.participants.length} player game</div>
                <div>{format(game.playedAt, "dd/MM/yyyy HH:mm")}</div>
                <div>Played at: {game.host}</div>
                {game.turns && <div>{game.turns} turns</div>}
            </section>
            <table className='game-details-table'>
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
        </div>
    );
}

const columnHelper = createColumnHelper<Participant>();
const columns: ColumnDef<Participant, any>[] = [
    columnHelper.accessor('placement', {
        id: 'placement',
        header: 'Placement',
        cell: ({row}) => row.original.placement + 1,
    }),
    columnHelper.accessor('commander.name', {
        id: 'commanderName',
        header: 'Commander'
    }),
    columnHelper.accessor('player.name', {
        id: 'playerName',
        header: 'Player'
    }),
    columnHelper.accessor('startingOrder', {
        id: 'startingOrder',
        header: 'Started'
    }),
];
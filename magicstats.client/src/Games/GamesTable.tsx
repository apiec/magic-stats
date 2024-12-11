import './GamesTable.css';
import {
    ColumnDef,
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    getSortedRowModel,
    useReactTable
} from "@tanstack/react-table";
import {Fragment, useEffect, useState} from "react";
import {GameDetails} from "./GameDetails/GameDetails.tsx";
import {format} from "date-fns";
import {Game, GamesApi} from './GamesApi.ts';
import {NavLink, useNavigate} from 'react-router-dom';
import {FaPen, FaTrash} from 'react-icons/fa';

export default function GamesTable() {
    const [games, setGames] = useState<Game[]>([]);
    const table = useReactTable({
        data: games,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getRowCanExpand: () => true,
        initialState: {
            sorting: [
                {
                    id: 'playedAt',
                    desc: true,
                }
            ]
        }
    });

    async function populateGameData() {
        const api = new GamesApi();
        const games = await api.getAll();
        setGames(games);
    }

    useEffect(() => {
        populateGameData();
    }, []);
    const navigate = useNavigate();

    async function handleNewGame() {
        const api = new GamesApi();
        const gameId = await api.createNewGame();
        await navigate(gameId);
    }

    return (
        <div className='games-table-component'>
            <div>
                <button className='new-game-button' onClick={handleNewGame}>
                    New game
                </button>
            </div>
            <table className='games-table'>
                <thead>
                {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                            <th key={header.id} colSpan={header.colSpan}>
                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                            </th>
                        ))}
                    </tr>
                ))
                }
                </thead>
                <tbody>
                {table.getRowModel().rows.map(row => (
                    <Fragment key={row.id}>
                        {!row.getIsExpanded() &&
                            (<tr onClick={() => row.toggleExpanded()}>
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>))}
                                </tr>
                            )}
                        {row.getIsExpanded() && (
                            <tr onClick={() => row.toggleExpanded()} className='game-details-row'>
                                <td colSpan={row.getAllCells().length} className='game-details-cell'>
                                    <GameDetails game={row.original}/>
                                </td>
                            </tr>
                        )}
                    </Fragment>
                ))}
                </tbody>
            </table>
        </div>
    );
}

const columnHelper = createColumnHelper<Game>();

const columns: ColumnDef<Game, any>[] = [
    columnHelper.accessor('playedAt', {
        id: 'playedAt',
        header: 'Played at',
        cell: props => format(props.row.original.playedAt, "dd/MM/yyyy HH:mm"),
    }),
    columnHelper.accessor(game => game.participants.length, {
        id: 'pod_size',
        header: 'Pod size',
    }),
    columnHelper.group({
        header: 'Winner',
        columns: [
            columnHelper.accessor((g) => g.winner?.commander.name ?? 'no data', {
                id: 'winning_commander',
                header: 'Commander'
            }),
            columnHelper.accessor((g) => g.winner?.player.name ?? 'no data', {id: 'winning_player', header: 'Player'}),
        ],
    }),
    columnHelper.display({
        id: 'edit',
        header: 'Edit',
        cell: props => <EditGameButton gameId={props.row.original.id}/>,
    }),
    columnHelper.display({
        id: 'delete',
        header: 'Delete',
        cell: props => <DeleteGameButton gameId={props.row.original.id}/>,
    })
];

type EditGameButtonProps = {
    gameId: string,
}

function EditGameButton({gameId}: EditGameButtonProps) {
    return (
        <NavLink to={gameId} onClick={(e) => e.stopPropagation()}>
            <FaPen/>
        </NavLink>
    );
}

type DeleteGameButtonProps = {
    gameId: string,
}

function DeleteGameButton({gameId}: DeleteGameButtonProps) {
    return (
        <NavLink to='' onClick={(e) => {
            e.stopPropagation();
            const api = new GamesApi();
            api.delete(gameId)
                .then(() => window.location.reload());
        }}>
            <FaTrash/>
        </NavLink>
    );
}
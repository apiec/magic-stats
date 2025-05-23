﻿import './GamesTable.css';
import {
    ColumnDef,
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
    VisibilityState
} from "@tanstack/react-table";
import {useEffect, useRef, useState} from "react";
import {GameDetails} from "./GameDetails/GameDetails.tsx";
import {format} from "date-fns";
import {Game, GamesApi} from './GamesApi.ts';
import {Link, useNavigate} from 'react-router-dom';
import {FaPen, FaTrash} from 'react-icons/fa';

export default function GamesTable() {
    const [games, setGames] = useState<Game[]>([]);
    const [currentGameId, setCurrentGameId] = useState<string>();
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
        'playedAt': true,
        'winning_commander': true,
        'winning_player': true,
        'pod_size': true,
        'turns': true,
        'host': true,
        'irl': true,
        'edit': true,
        'delete': true,
    });

    useEffect(() => {
        const handleResize = () => {
            const isMobile = window.innerWidth < 768;
            setColumnVisibility({
                'playedAt': true,
                'winning_commander': true,
                'winning_player': true,
                'pod_size': true,
                'turns': !isMobile,
                'host': !isMobile,
                'irl': !isMobile,
                'edit': true,
                'delete': true,
            });
        }
        window.addEventListener('resize', handleResize);
        handleResize();
    }, []);

    const currentGame = games.find(g => g.id === currentGameId);

    const dialogRef = useRef<HTMLDialogElement>(null);
    const table = useReactTable({
        data: games,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        initialState: {
            sorting: [
                {
                    id: 'playedAt',
                    desc: true,
                }
            ]
        },
        state: {
            columnVisibility,
        },
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
        const game = await api.createNewGame();
        await navigate(game.id);
    }

    function toggleDialog() {
        if (!dialogRef.current) {
            return;
        }
        dialogRef.current.hasAttribute("open")
            ? dialogRef.current.close()
            : dialogRef.current.showModal();
    }

    return (
        <div className='games-table-component'>
            <dialog className='game-details-dialog' ref={dialogRef} onClick={(e) => {
                if (e.currentTarget === e.target) {
                    toggleDialog();
                }
            }}>
                {
                    currentGame ? <GameDetails game={currentGame}/> : 'dupa'
                }
            </dialog>
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
                    <tr key={row.id} onClick={() => {
                        setCurrentGameId(row.original.id);
                        toggleDialog();
                    }}>
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

const columnHelper = createColumnHelper<Game>();

const columns: ColumnDef<Game, any>[] = [
    columnHelper.accessor('playedAt', {
        id: 'playedAt',
        header: 'Played at',
        cell: props => format(props.row.original.playedAt, "dd/MM/yyyy HH:mm"),
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
    columnHelper.accessor(game => game.participants.length, {
        id: 'pod_size',
        header: 'Pod size',
    }),
    columnHelper.accessor('turns', {
        id: 'turns',
        header: 'Turns',
        cell: props => props.row.original.turns ?? '-',
    }),
    columnHelper.accessor('host', {
        id: 'host',
        header: 'Host',
        cell: props => props.row.original.host ?? '-',
    }),
    columnHelper.accessor('irl', {
        id: 'irl',
        header: 'IRL/online',
        cell: props => props.row.original.irl === null ? '-' : props.row.original.irl ? 'IRL' : 'online',
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
        <Link to={gameId} className='button-like edit-game' onClick={(e) => e.stopPropagation()}>
            <FaPen/>
        </Link>
    );
}

type DeleteGameButtonProps = {
    gameId: string,
}

function DeleteGameButton({gameId}: DeleteGameButtonProps) {
    return (
        <FaTrash className='button-like delete-game' onClick={(e) => {
            e.stopPropagation();
            const api = new GamesApi();
            api.delete(gameId)
                .then(() => window.location.reload());
        }}/>
    );
}
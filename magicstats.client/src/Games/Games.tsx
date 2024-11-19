import './Games.css';
import {
    ColumnDef,
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    getSortedRowModel,
    useReactTable
} from "@tanstack/react-table";
import {Fragment, useState} from "react";
import {GameDetails} from "./GameDetails/GameDetails.tsx";
import {format} from "date-fns";

export default function Games() {
    const [data, _setData] = useState<Game[]>(mockData);
    const table = useReactTable({
        data,
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

    return (
        <div className='games-table'>
            <table>
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
                columnHelper.accessor('winner.commander.name', {id: 'winning_commander', header: 'Commander'}),
                columnHelper.accessor('winner.player.name', {id: 'winning_player', header: 'Player'}),
            ],
        }),
    ]
;

type Game = {
    id: string,
    lastModified: Date,
    playedAt: Date,
    participants: Participant[],
    winner: Participant,
}

type Participant = {
    commander: Commander,
    player: Player,
    startingOrder: number,
    placement: number,
}

type Commander = {
    id: string,
    name: string,
}

type Player = {
    id: string,
    name: string,
}

const mockData: Game[] = [
    {
        id: '1',
        lastModified: new Date('2024-01-06T21:37:00.000Z'),
        playedAt: new Date('2024-01-06T21:37:00.000Z'),
        participants: [
            {
                commander: {
                    id: '0',
                    name: 'Yargle',
                },
                player: {
                    id: '0',
                    name: 'Maszer',
                },
                startingOrder: 1,
                placement: 2,
            },
            {
                commander: {
                    id: '1',
                    name: 'Ezio',
                },
                player: {
                    id: '1',
                    name: 'Dominik',
                },
                startingOrder: 2,
                placement: 1,
            },
            {
                commander: {
                    id: '2',
                    name: 'Breena',
                },
                player: {
                    id: '2',
                    name: 'Michael',
                },
                startingOrder: 3,
                placement: 3,
            },
        ],
        winner: {
            commander: {
                id: '1',
                name: 'Ezio',
            },
            player: {
                id: '1',
                name: 'Dominik',
            },
            startingOrder: 2,
            placement: 1,
        },
    },
    {
        id: '2',
        lastModified:
            new Date('2024-06-06T21:37:00.000Z'),
        playedAt:
            new Date('2024-06-06T21:37:00.000Z'),
        participants:
            [
                {
                    commander: {
                        id: '0',
                        name: 'Yargle',
                    },
                    player: {
                        id: '0',
                        name: 'Maszer',
                    },
                    startingOrder: 1,
                    placement: 1,
                },
                {
                    commander: {
                        id: '1',
                        name: 'Ezio',
                    },
                    player: {
                        id: '1',
                        name: 'Dominik',
                    },
                    startingOrder: 2,
                    placement: 2,
                },
            ],
        winner: {
            commander: {
                id: '0',
                name: 'Yargle',
            },
            player: {
                id: '0',
                name: 'Maszer',
            },
            startingOrder: 1,
            placement: 1,
        },
    },
    {
        id: '3',
        lastModified: new Date('2024-01-06T21:37:00.000Z'),
        playedAt: new Date('2024-01-08T21:37:00.000Z'),
        participants: [
            {
                commander: {
                    id: '0',
                    name: 'Yargle',
                },
                player: {
                    id: '0',
                    name: 'Maszer',
                },
                startingOrder: 1,
                placement: 3,
            },
            {
                commander: {
                    id: '1',
                    name: 'Ezio',
                },
                player: {
                    id: '1',
                    name: 'Dominik',
                },
                startingOrder: 2,
                placement: 2,
            },
            {
                commander: {
                    id: '2',
                    name: 'Breena',
                },
                player: {
                    id: '2',
                    name: 'Michael',
                },
                startingOrder: 3,
                placement: 1,
            },
        ],
        winner: {
            commander: {
                id: '2',
                name: 'Breena',
            },
            player: {
                id: '2',
                name: 'Michael',
            },
            startingOrder: 3,
            placement: 1,
        },

    },
];
export type {Game, Participant, Commander, Player};
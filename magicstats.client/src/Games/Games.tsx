import './Games.css';
import {
    ColumnDef,
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    useReactTable
} from "@tanstack/react-table";
import {Fragment, useState} from "react";
import {GameTab} from "./GameTab/GameTab.tsx";

export default function Games() {
    const [data, _setData] = useState<Game[]>(mockData);
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getRowCanExpand: () => true,
    });

    return (
        <div className='games-table'>
            <table>
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
                    <Fragment key={row.id}>
                        {<tr onClick={() => row.toggleExpanded()}>
                            {row.getVisibleCells().map(cell => (
                                <td key={cell.id}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>))}
                        </tr>}
                        {row.getIsExpanded() && (
                            <tr>
                                <td colSpan={row.getAllCells().length} className='game-tab-cell'>
                                    <GameTab game={row.original}/>
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
    columnHelper.accessor('id', {id: 'id', header: 'ID'}),
    columnHelper.accessor('playedAt', {id: 'playedAt', header: 'Played at'})
];

type Game = {
    id: string,
    lastModified: Date,
    playedAt: Date,
    participants: Participant[],
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
        lastModified: new Date('2024-05-06T21:37:00.000Z'),
        playedAt: new Date('2024-05-06T21:37:00.000Z'),
        participants: [
            {
                commander: {
                    id: '0',
                    name: 'commander 0',
                },
                player: {
                    id: '0',
                    name: 'player 0',
                },
                startingOrder: 0,
                placement: 0,
            },
            {
                commander: {
                    id: '1',
                    name: 'commander 1',
                },
                player: {
                    id: '1',
                    name: 'player 1',
                },
                startingOrder: 1,
                placement: 1,
            },
            {
                commander: {
                    id: '2',
                    name: 'commander 2',
                },
                player: {
                    id: '2',
                    name: 'player 2',
                },
                startingOrder: 2,
                placement: 2,
            },
        ],
    },
    {
        id: '2',
        lastModified: new Date('2024-06-06T21:37:00.000Z'),
        playedAt: new Date('2024-06-06T21:37:00.000Z'),
        participants: [
            {
                commander: {
                    id: '0',
                    name: 'commander 0',
                },
                player: {
                    id: '0',
                    name: 'player 0',
                },
                startingOrder: 0,
                placement: 0,
            },
            {
                commander: {
                    id: '1',
                    name: 'commander 1',
                },
                player: {
                    id: '1',
                    name: 'player 1',
                },
                startingOrder: 1,
                placement: 1,
            },
        ],
    },
];

export type {Game, Participant, Commander, Player};
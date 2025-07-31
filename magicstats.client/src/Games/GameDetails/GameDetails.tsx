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
import {Dialog, Inset, Table, Text} from '@radix-ui/themes';
import {ReactNode} from 'react';
import {FaTrophy} from 'react-icons/fa'

interface GameDetailsProps {
    game: Game,
    trigger: ReactNode,
}

export function GameDetails({game, trigger}: GameDetailsProps) {
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
        <Dialog.Root>
            <Dialog.Trigger>
                {trigger}
            </Dialog.Trigger>
            <Dialog.Content>
                <Dialog.Title align='center'>{game.participants.length} player game</Dialog.Title>
                <Dialog.Description align='center'>
                    <Text as='div' size='3'>{format(game.playedAt, "dd/MM/yyyy HH:mm")}</Text>
                    <Text as='div' size='2'>Played at: {game.host}</Text>
                    {game.turns && <Text as={'div'}>{game.turns} turns</Text>}
                </Dialog.Description>
                <Inset side='x' mt='3'>
                    <Table.Root>
                        <Table.Header>
                            {table.getHeaderGroups().map(headerGroup => (
                                <Table.Row key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <Table.Cell key={header.id} align='center'>
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </Table.Cell>
                                    ))}
                                </Table.Row>
                            ))
                            }
                        </Table.Header>
                        <Table.Body>
                            {table.getRowModel().rows.map(row => (
                                <Table.Row key={row.id}>
                                    {row.getVisibleCells().map(cell => (
                                        <Table.Cell key={cell.id} align='center'>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </Table.Cell>))}
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table.Root>
                </Inset>
            </Dialog.Content>
        </Dialog.Root>
    );
}

const columnHelper = createColumnHelper<Participant>();
const columns: ColumnDef<Participant, any>[] = [
    columnHelper.accessor('placement', {
        id: 'placement',
        header: 'Placement',
        cell: ({row}) => row.original.placement === 0 ? <FaTrophy/> : row.original.placement + 1,
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
        header: 'Started',
        cell: ({row}) => row.original.startingOrder + 1,
    }),
];
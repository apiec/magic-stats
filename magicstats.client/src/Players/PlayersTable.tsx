import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    TableState,
    useReactTable
} from '@tanstack/react-table';
import {Player, PlayerWithStats} from './PlayerApi';
import {useImmer} from 'use-immer';
import SortableHeader from "../Shared/SortableHeader.tsx";
import PlayerApi from "../Players/PlayerApi.ts";
import {Dialog, Flex, IconButton, Table, Text, Tooltip} from '@radix-ui/themes';
import DeleteButton from '../Shared/DeleteButton.tsx';
import {useState} from 'react';
import {Pencil1Icon} from '@radix-ui/react-icons';
import {FaPersonWalkingLuggage} from "react-icons/fa6";
import PlayerForm from "./PlayerForm.tsx";

type PlayersTableProps = {
    players: PlayerWithStats[],
    lastXWindowSize: number,
}

export default function PlayersTable({players}: PlayersTableProps) {
    const table = useReactTable({
        data: players,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        initialState: {
            sorting: [
                {
                    id: 'winrate',
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
        <Table.Root variant='surface'>
            <Table.Header>
                {table.getHeaderGroups().map(headerGroup => (
                    <Table.Row key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                            <Table.RowHeaderCell key={header.id}>
                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                            </Table.RowHeaderCell>
                        ))}
                    </Table.Row>))}
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
    );
}

const columnHelper = createColumnHelper<PlayerWithStats>();

const columns = [
    columnHelper.accessor('name', {
        id: 'name',
        header: ctx => <SortableHeader text='Name' context={ctx}/>,
        cell: props => {
            const player = props.row.original;
            const name = <Text>{player.name}</Text>
            if (!player.isGuest) {
                return name;
            }

            return (
                <Tooltip content='Guest player'>
                    <Flex direction='row' gap='1' align='center' justify='center'>
                        {name}
                        <FaPersonWalkingLuggage/>
                    </Flex>
                </Tooltip>
            );
        }
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
        header: ctx => <SortableHeader text={'WR%'} context={ctx}/>,
        cell: props => toPercentage(props.row.original.stats.winrate)
    }),
    columnHelper.accessor('stats.winrateLastX', {
        id: 'winrateLastX',
        header: ctx => <SortableHeader text={'WRLX'} context={ctx}/>,
        cell: props => toPercentage(props.row.original.stats.winrateLastX)
    }),
    columnHelper.display({
        id: 'edit',
        header: 'Edit',
        cell: props => {
            return <EditPlayerDialog player={props.row.original}/>
        }

    }),
    columnHelper.display({
        id: 'delete',
        header: 'Delete',
        cell: props => <DeleteButton onClick={() => {
            const api = new PlayerApi();
            api.delete(props.row.original.id)
                .then(() => window.location.reload());
        }}/>,
    }),
];

type EditPlayerDialogProps = {
    player: Player,
};

function EditPlayerDialog({player}: EditPlayerDialogProps) {
    const [open, setOpen] = useState<boolean>(false);
    return <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger>
            <IconButton size='1' variant='ghost' asChild>
                <Pencil1Icon/>
            </IconButton>
        </Dialog.Trigger>
        <Dialog.Content maxWidth='300px'>
            <Dialog.Title>
                Edit player
            </Dialog.Title>
            <PlayerForm player={player} onSubmit={p => {
                const api = new PlayerApi();
                api.update(p).then(() => {
                    setOpen(false);
                    window.location.reload();
                });
            }}/>
        </Dialog.Content>
    </Dialog.Root>;
}

function toPercentage(num: number): string {
    return (100 * num).toFixed(0);
}

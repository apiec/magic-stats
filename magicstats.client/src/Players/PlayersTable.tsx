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
import {Flex, HoverCard, Link, Table, Text} from '@radix-ui/themes';
import DeleteButton from '../Shared/DeleteButton.tsx';
import {FaPersonWalkingLuggage} from "react-icons/fa6";
import {Link as RouterLink} from 'react-router-dom';
import {PlayerAvatar} from "./PlayerAvatar.tsx";

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
        cell: props => <PlayerName player={props.row.original}/>
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
        id: 'delete',
        header: 'Delete',
        cell: props => <DeleteButton onClick={() => {
            const api = new PlayerApi();
            api.delete(props.row.original.id)
                .then(() => window.location.reload());
        }}/>,
    }),
];


type PlayerNameProps = {
    player: Player,
}

function PlayerName({player}: PlayerNameProps) {
    const name = (
        <Flex direction='row' gap='1' align='center' justify='center'>
            <Link asChild style={{color: 'var(--color)'}}>
                <RouterLink to={player.id}>
                    <Text>{player.name}</Text>
                </RouterLink>
            </Link>
            {player.isGuest && <FaPersonWalkingLuggage/>}
        </Flex>
    );

    return (
        <HoverCard.Root openDelay={700}>
            <HoverCard.Trigger>
                {name}
            </HoverCard.Trigger>
            <HoverCard.Content>
                <Flex direction='row' align='center' gap='3'>
                    <PlayerAvatar player={player} size='3'/>
                    <Flex direction='column' align='start'>
                        <Text size='3'>{player.name}</Text>
                        {player.isGuest &&
                            <Flex direction='row' gap='1' align='center'>
                                <Text size='2'>Guest</Text>
                                <Text size='2' asChild><FaPersonWalkingLuggage/></Text>
                            </Flex>
                        }
                    </Flex>
                </Flex>
            </HoverCard.Content>
        </HoverCard.Root>
    );
}

function toPercentage(num: number): string {
    return (100 * num).toFixed(0);
}

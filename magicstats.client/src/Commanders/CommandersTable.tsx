import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    TableState,
    useReactTable
} from '@tanstack/react-table';
import {Commander, CommanderWithStats} from './CommanderApi';
import {useImmer} from 'use-immer';
import SortableHeader from "../Shared/SortableHeader.tsx";
import CommanderApi from "../Commanders/CommanderApi.ts";
import {Box, Flex, HoverCard, Inset, Link, Table, Text} from '@radix-ui/themes';
import {Link as RouterLink} from 'react-router-dom';
import DeleteButton from '../Shared/DeleteButton.tsx';

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

const columnHelper = createColumnHelper<CommanderWithStats>();

const columns = [
    columnHelper.accessor('name', {
        id: 'name',
        header: ctx => <SortableHeader text='Name' context={ctx}/>,
        cell: props => <CommanderName commander={props.row.original}/>
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
        cell: props => <DeleteButton onClick={() => {
            const api = new CommanderApi();
            api.delete(props.row.original.id)
                .then(() => window.location.reload());
        }}/>,
    })
];

function toPercentage(num: number): string {
    return (100 * num).toFixed(0);
}

type CommanderNameProps = {
    commander: Commander,
}

export function CommanderName({commander}: CommanderNameProps) {
    const displayName = commander.card?.name
        ? commander.card.name + (commander.partner ? ' // ' + commander.partner.name : '')
        : commander.name;

    const nameLinkComponent = (
        <Flex direction='row' gap='1' align='center' justify='center'>
            <Link asChild style={{color: 'var(--color)'}}>
                <RouterLink reloadDocument to={'/commanders/' + commander.id}>
                    <Text>{displayName}</Text>
                </RouterLink>
            </Link>
        </Flex>
    );

    if (!commander?.card?.images) {
        return nameLinkComponent;
    }

    return (
        <HoverCard.Root openDelay={700}>
            <HoverCard.Trigger>
                {nameLinkComponent}
            </HoverCard.Trigger>
            <HoverCard.Content maxWidth='600px'>
                <Inset>
                    <Box width='100%' asChild>
                        <Flex>
                            <Box maxWidth='300px' asChild>
                                <img src={commander.card.images.png} alt='commander image'/>
                            </Box>
                            {commander.partner &&
                                <Box maxWidth='300px' asChild>
                                    <img src={commander.partner.images.png} alt='commander image'/>
                                </Box>
                            }
                        </Flex>
                    </Box>
                </Inset>
            </HoverCard.Content>
        </HoverCard.Root>
    );
}
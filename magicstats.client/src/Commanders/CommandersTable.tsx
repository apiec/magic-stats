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
import {toPercentage} from "../Shared/toPercentage.ts";
import {FullCardDisplay} from "./CommanderPage.tsx";

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
    columnHelper.display({
        id: 'name',
        header: ctx => <SortableHeader text='Name' context={ctx}/>,
        cell: props => <CommanderName commander={props.row.original.commander}/>
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
    columnHelper.display({
        id: 'delete',
        header: 'Delete',
        cell: props => <DeleteButton onClick={() => {
            const api = new CommanderApi();
            api.delete(props.row.original.commander.id)
                .then(() => window.location.reload());
        }}/>,
    })
];

type CommanderNameProps = {
    commander: Commander,
}

export function CommanderName({commander}: CommanderNameProps) {
    const nameLinkComponent = (
        <Link asChild style={{color: 'var(--color)'}}>
            <RouterLink reloadDocument to={'/commanders/' + commander.id}>
                <Text wrap='wrap'>{commander.displayName}</Text>
            </RouterLink>
        </Link>
    );

    if (!commander?.card?.images) {
        return nameLinkComponent;
    }

    return (
        <HoverCard.Root openDelay={700}>
            <HoverCard.Trigger>
                {nameLinkComponent}
            </HoverCard.Trigger>
            <HoverCard.Content>
                <Inset>
                    <Box width='100%' asChild>
                        <CommanderCardDisplay commander={commander}/>
                    </Box>
                </Inset>
            </HoverCard.Content>
        </HoverCard.Root>
    );
}

type CommanderCardDisplayProps = {
    commander: Commander,
}

function CommanderCardDisplay({commander}: CommanderCardDisplayProps) {
    return <Flex>
        {commander.card && <FullCardDisplay card={commander.card} width='300px'/>}
        {commander.partner && <FullCardDisplay card={commander.partner} width='300px'/>}
    </Flex>;
}
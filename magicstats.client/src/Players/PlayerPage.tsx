import {Box, Card, Flex, Grid, Heading, ScrollArea, Spinner, Table, Text} from "@radix-ui/themes";
import {useParams} from "react-router-dom";
import PlayerApi, {
    CommanderStats,
    Player,
    SinglePlayerWithStats
} from "./PlayerApi.ts";
import {useEffect, useState} from "react";
import {PlayerAvatar} from "./PlayerAvatar.tsx";
import {FaPersonWalkingLuggage} from "react-icons/fa6";
import ValueDisplay from "../Shared/ValueDisplay.tsx";
import SortableHeader from "../Shared/SortableHeader.tsx";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    TableState,
    useReactTable
} from "@tanstack/react-table";
import {useImmer} from "use-immer";

export default function PlayerPage() {
    const {playerId} = useParams<string>();
    const [player, setPlayer] = useState<SinglePlayerWithStats | undefined>();
    useEffect(() => {
        if (playerId === undefined) {
            return;
        }

        const api = new PlayerApi();
        api.get(playerId).then(p => setPlayer(p));
    }, []);

    if (player === undefined) {
        return <Flex direction='column' align='center' gap='2'>
            <Text>Loading player data</Text>
            <Spinner/>
        </Flex>;
    }

    return (
        <Grid columns='250px 1fr' width='90%' gap='7'>
            <Box>
                <Card>
                    <PlayerSummary player={player}/>
                </Card>
            </Box>
            <Box width='100%' asChild>
                <Flex direction='row' align='center' gap='9'>
                    <Flex direction='column' gap='4' justify='center' align='end'>
                        <ValueDisplay title='Total games' values={[player.stats.games.toFixed(0)]}/>
                        <ValueDisplay title='Winrate' values={[toPercentage(player.stats.winrate)]}/>
                        <ValueDisplay title='WR last 30 games' values={[toPercentage(player.stats.winrateLast30)]}/>
                    </Flex>
                    <Box maxWidth='600px' maxHeight='300px' asChild>
                        <Flex direction='column'>
                            <Heading> Commanders </Heading>
                            <ScrollArea>
                                <CommanderStatsTable playerId={player.id}/>
                            </ScrollArea>
                        </Flex>
                    </Box>
                </Flex>
            </Box>
        </Grid>
    );
}

type PlayerSummaryCardProps = {
    player: Player
}

function PlayerSummary({player}: PlayerSummaryCardProps) {
    return (
        <Flex direction='row' align='center' gap='3' p='1'>
            <PlayerAvatar player={player} size='6'/>
            <Flex gap='2' direction='column' align='start'>
                <Text size='6'>{player.name}</Text>
                {player.isGuest &&
                    <Flex direction='row' gap='1' align='center'>
                        <Text size='3'>Guest</Text>
                        <Text size='3' asChild><FaPersonWalkingLuggage/></Text>
                    </Flex>
                }
            </Flex>
        </Flex>
    );
}

type CommanderStatsTableProps = {
    playerId: string,
}

function CommanderStatsTable({playerId}: CommanderStatsTableProps) {
    const [stats, setStats] = useState<CommanderStats[]>([]);

    useEffect(() => {
        const api = new PlayerApi();
        api.getCommanders(playerId).then(r => setStats(r.commanders));
    }, [playerId]);

    const table = useReactTable({
        data: stats,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        initialState: {
            sorting: [
                {
                    id: 'games',
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
    if (stats === undefined) {
        return <Spinner/>;
    }

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

const columnHelper = createColumnHelper<CommanderStats>();

const columns = [
    columnHelper.accessor('name', {
        id: 'name',
        header: ctx => <SortableHeader text='Name' context={ctx}/>,
    }),
    columnHelper.accessor('games', {
        id: 'games',
        header: ctx => <SortableHeader text='Games' context={ctx}/>,
    }),
    columnHelper.accessor('winrate', {
        id: 'winrate',
        header: ctx => <SortableHeader text={'Winrate'} context={ctx}/>,
        cell: props => toPercentage(props.row.original.winrate),
    }),
];

function toPercentage(num: number): string {
    return (100 * num).toFixed(0) + '%'
}

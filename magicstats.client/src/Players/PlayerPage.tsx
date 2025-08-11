import {Box, Card, Flex, Heading, ScrollArea, Spinner, Table, Text} from "@radix-ui/themes";
import {useParams} from "react-router-dom";
import PlayerApi, {CommanderStats, Player, SinglePlayerWithStats} from "./PlayerApi.ts";
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
    const [commanderStats, setCommanderStats] = useState<CommanderStats[]>([]);

    useEffect(() => {
        const api = new PlayerApi();
        api.get(playerId!).then(p => setPlayer(p));
    }, []);
    useEffect(() => {
        const api = new PlayerApi();
        api.getPlayerCommanderStats(playerId!).then(r => setCommanderStats(r.commanders));
    }, [playerId]);

    if (player === undefined) {
        return <Flex direction='column' align='center' gap='2'>
            <Text>Loading player data</Text>
            <Spinner/>
        </Flex>;
    }

    function getMostPlayedCommanderDisplay() {
        if (commanderStats === undefined || commanderStats.length === 0) {
            return ['No games on record'];
        }
        const mostGames = Math.max(...commanderStats.map(x => x.games));
        const mostPlayedCommander = commanderStats.find(x => x.games === mostGames);
        return [mostPlayedCommander!.name, mostGames.toFixed(0)];
    }

    function getBestCommanderDisplay() {
        if (commanderStats === undefined || commanderStats.length === 0) {
            return ['No games on record'];
        }
        const filtered = commanderStats.filter(x => x.games >= 3);
        const bestWinrate = Math.max(...filtered.map(x => x.winrate));
        const bestCommander = filtered.find(x => x.winrate === bestWinrate);
        return [bestCommander!.name, toPercentage(bestWinrate)];
    }

    return (
        <Flex direction='column' gap='7' align='center'>
            <Box maxWidth='fit-content' height='fit-content' asChild>
                <Card>
                    <PlayerSummary player={player}/>
                </Card>
            </Box>
            <Flex gap='2' align='center' wrap='wrap' maxWidth='500px' justify='center'>
                <ValueDisplay title='Total games' values={[player.stats.games.toFixed(0)]}/>
                <ValueDisplay title='Winrate' values={[toPercentage(player.stats.winrate)]}/>
                <ValueDisplay title='WR last 30 games' values={[toPercentage(player.stats.winrateLast30)]}/>
                {commanderStats
                    ?
                    <ValueDisplay title='Best' values={getBestCommanderDisplay()}
                                  tooltip='Highest winrate commander with 5+ games'/>
                    : <Spinner/>
                }
                {commanderStats
                    ? <ValueDisplay title='Most played' values={getMostPlayedCommanderDisplay()}/>
                    : <Spinner/>
                }
            </Flex>
            <Flex gap='2'>
            </Flex>
            <Box width='100%' asChild>
                <Box maxWidth='600px' maxHeight='300px' asChild>
                    <Flex direction='column'>
                        <Heading>Commanders</Heading>
                        {
                            commanderStats
                                ? <ScrollArea>
                                    <CommanderStatsTable stats={commanderStats}/>
                                </ScrollArea>
                                : <Spinner/>
                        }
                    </Flex>
                </Box>
            </Box>
        </Flex>
    );
}

type PlayerSummaryCardProps = {
    player: Player
}

function PlayerSummary({player}: PlayerSummaryCardProps) {
    return (
        <Flex direction='row' align='center' gap='3' p='1'>
            <PlayerAvatar player={player} size='6' radius='full'/>
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
    stats: CommanderStats[],
}

function CommanderStatsTable({stats}: CommanderStatsTableProps) {
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
        <Table.Root variant='ghost'>
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

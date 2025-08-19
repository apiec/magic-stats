import {
    Box,
    Card,
    Dialog,
    Flex,
    Grid,
    Heading,
    IconButton,
    ScrollArea,
    SegmentedControl,
    Spinner,
    Text,
    Tooltip,
} from "@radix-ui/themes";
import {format} from "date-fns";
import {useParams} from "react-router-dom";
import PlayerApi, {
    CommanderStats,
    Player,
    PlayerWithWinrates,
    Pod,
    RecentGame,
    RecordAgainstPlayer,
    SinglePlayerWithStats
} from "./PlayerApi.ts";
import {useEffect, useState} from "react";
import {PlayerAvatar} from "./PlayerAvatar.tsx";
import {FaPersonWalkingLuggage,} from "react-icons/fa6";
import ValueDisplay from "../Shared/ValueDisplay.tsx";
import {CommanderStatsTable} from "./CommanderStatsTable.tsx";
import {InfoCircledIcon, Pencil1Icon} from "@radix-ui/react-icons";
import PlayerForm from "./PlayerForm.tsx";
import {PlayerRecentGamesTable} from "./PlayerRecentGamesTable.tsx";
import {PlayerPodsTable} from "./PlayerPodsTable.tsx";
import {DataPoint, DataSeries} from "../Shared/WinrateGraph.tsx";
import {CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip as GraphTooltip, XAxis, YAxis} from "recharts";
import {RecordAgainstPlayerTable} from "./RecordAgainstPlayerTable.tsx";

export default function PlayerPage() {
    const {playerId} = useParams<string>();
    const [player, setPlayer] = useState<SinglePlayerWithStats | undefined>();
    const [commanderStats, setCommanderStats] = useState<CommanderStats[] | undefined>();

    useEffect(() => {
        const api = new PlayerApi();
        api.get(playerId!).then(p => setPlayer(p));
    }, [playerId]);
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
        if (mostPlayedCommander === undefined) {
            return ['Not enough games'];
        }
        return [mostPlayedCommander.name, mostGames.toFixed(0)];
    }

    function getBestCommanderDisplay() {
        if (commanderStats === undefined || commanderStats.length === 0) {
            return ['No games on record'];
        }
        const filtered = commanderStats.filter(x => x.games >= 3);
        const bestWinrate = Math.max(...filtered.map(x => x.winrate));
        const bestCommander = filtered.find(x => x.winrate === bestWinrate);
        if (bestCommander === undefined) {
            return ['Not enough games'];
        }
        return [bestCommander.name, toPercentage(bestWinrate)];
    }

    return (
        <Flex direction='column' gap='7' align='center'>
            <Box maxWidth='fit-content' height='fit-content' asChild>
                <Card>
                    <PlayerSummary player={player} onPlayerUpdate={(p) => {
                        const newPlayer = {...player, ...p} as SinglePlayerWithStats;
                        setPlayer(newPlayer);
                    }}/>
                </Card>
            </Box>
            <Flex>
                <Flex gap='2' align='center' wrap='wrap' maxWidth='500px' justify='center'>
                    <ValueDisplay title='Total games' values={[player.stats.games.toFixed(0)]}/>
                    <ValueDisplay title='Recent winrate' values={[toPercentage(player.stats.winrateLast30)]}
                                  tooltip='Winrate from the last 30&nbsp;games'/>
                    <ValueDisplay title='All time winrate' values={[toPercentage(player.stats.winrate)]}/>
                    {commanderStats
                        ? <ValueDisplay title='Best' values={getBestCommanderDisplay()}
                                        tooltip='Highest winrate commander with&nbsp;at&nbsp;least 5&nbsp;recorded games'/>
                        : <Spinner/>
                    }
                    {commanderStats
                        ? <ValueDisplay title='Most played' values={getMostPlayedCommanderDisplay()}/>
                        : <Spinner/>
                    }
                </Flex>
            </Flex>
            <Grid gap='7' columns={{initial: '1', md: '2',}}>
                <Box width='360px' maxWidth='90vw' maxHeight='300px' asChild>
                    <Flex direction='column'>
                        <Heading>Winrate</Heading>
                        <PlayerWinrateGraph playerId={playerId!}/>
                    </Flex>
                </Box>
                <Box width='360px' maxWidth='90vw' maxHeight='300px' asChild>
                    <Flex direction='column'>
                        <Heading>Recent games</Heading>
                        <PlayerRecentGames playerId={playerId!} gameCount={30}/>
                    </Flex>
                </Box>
                <Box width='360px' maxWidth='90vw' maxHeight='300px' asChild>
                    <Flex direction='column'>
                        <Heading>Played commanders</Heading>
                        {
                            commanderStats
                                ? <ScrollArea>
                                    <CommanderStatsTable stats={commanderStats}/>
                                </ScrollArea>
                                : <Spinner/>
                        }
                    </Flex>
                </Box>
                <Box width='360px' maxWidth='90vw' maxHeight='300px' asChild>
                    <Flex direction='column'>
                        <Heading>Most played pods</Heading>
                        <PlayerPods playerId={playerId!}/>
                    </Flex>
                </Box>
            </Grid>
            <Box maxWidth='90vw' maxHeight='400px' asChild>
                <Flex direction='column'>
                    <Heading>Opponents</Heading>
                    <RecordAgainstPlayers playerId={playerId!}/>
                </Flex>
            </Box>
        </Flex>
    );
}

type PlayerSummaryCardProps = {
    player: Player,
    onPlayerUpdate: (player: Player) => void,
}

function PlayerSummary({player, onPlayerUpdate}: PlayerSummaryCardProps) {
    return (
        <Flex direction='row' align='center' gap='3' p='1'>
            <PlayerAvatar player={player} size='6' radius='full'/>
            <Flex gap='2' direction='column' align='start'>
                <Flex direction='row' align='center' gap='2'>
                    <Text size='6'>{player.name}</Text>
                    <EditPlayerDialog player={player} onUpdate={onPlayerUpdate}/>
                </Flex>
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

type PlayerRecentGamesProps = {
    playerId: string,
    gameCount: number,
}

function PlayerRecentGames({playerId, gameCount}: PlayerRecentGamesProps) {
    const [games, setGames] = useState<RecentGame[] | undefined>();
    useEffect(() => {
        const api = new PlayerApi();
        api.getRecentGames(playerId, gameCount).then((res) => setGames(res.recentGames));
    }, []);
    return games
        ? <ScrollArea>
            <PlayerRecentGamesTable games={games}/>
        </ScrollArea>
        : <Spinner/>;
}

type PlayerPodsProps = {
    playerId: string,
}

function PlayerPods({playerId}: PlayerPodsProps) {
    const [pods, setPods] = useState<Pod[] | undefined>();
    useEffect(() => {
        const api = new PlayerApi();
        api.getPods(playerId).then((res) => setPods(res));
    }, []);
    return pods
        ? <ScrollArea>
            <PlayerPodsTable pods={pods}/>
        </ScrollArea>
        : <Spinner/>;
}

type RecordAgainstPlayersProps = {
    playerId: string,
}

function RecordAgainstPlayers({playerId}: RecordAgainstPlayersProps) {
    const [records, setRecords] = useState<RecordAgainstPlayer[] | undefined>();
    useEffect(() => {
        const api = new PlayerApi();
        api.getRecordAgainstPlayers(playerId).then((res) => setRecords(res));
    }, []);
    return records
        ? <RecordAgainstPlayerTable records={records}/>
        : <Spinner/>;
}

function toPercentage(num: number): string {
    return (100 * num).toFixed(0) + '%'
}

type EditPlayerDialogProps = {
    player: Player,
    onUpdate: (player: Player) => void,
};

function EditPlayerDialog({player, onUpdate}: EditPlayerDialogProps) {
    const [open, setOpen] = useState<boolean>(false);
    return <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger>
            <IconButton size='1' variant='ghost' radius='small' asChild>
                <Box asChild>
                    <Pencil1Icon/>
                </Box>
            </IconButton>
        </Dialog.Trigger>
        <Dialog.Content maxWidth='300px'>
            <Dialog.Title>
                Edit player
            </Dialog.Title>
            <PlayerForm
                player={player}
                onClose={() => setOpen(false)}
                onSubmit={p => {
                    const api = new PlayerApi();
                    api.update(p).then((res) => {
                        onUpdate(res);
                        setOpen(false);
                    });
                }}/>
        </Dialog.Content>
    </Dialog.Root>;
}

type PlayerWinrateGraphProps = {
    playerId: string;
}

type SeriesType = 'recent' | 'allTime';

function PlayerWinrateGraph({playerId}: PlayerWinrateGraphProps) {
    const [recentData, setRecentData] = useState<DataSeries | undefined>(undefined);
    const [allTimeData, setAllTimeData] = useState<DataSeries | undefined>(undefined);
    const [seriesUsed, setSeriesUsed] = useState<SeriesType>('recent');

    function mapData(data: PlayerWithWinrates[]): DataSeries {
        const playerData = data.find(d => d.id === playerId)!;
        return {
            name: playerData.name,
            data: playerData.dataPoints.map(d => {
                return {
                    date: new Date(d.date).valueOf(),
                    value: d.winrate,
                } as DataPoint;
            })
        } as DataSeries;
    }

    function populateData() {
        const api = new PlayerApi();
        api.getWinrates(30).then(mapData).then(setRecentData);
        api.getWinrates().then(mapData).then(setAllTimeData);
    }

    useEffect(() => {
        populateData();
    }, []);

    const usedData = seriesUsed === 'recent' ? recentData : allTimeData;
    if (usedData === undefined) {
        return <Spinner/>;
    }

    const minDate = Math.min(...usedData.data.map(p => p.date));
    const maxDate = Math.max(...usedData.data.map(p => p.date));
    const stepCount = 5;
    const step = Math.floor((maxDate - minDate) / stepCount);
    const lastStepFix = maxDate - minDate - step * stepCount;
    const ticks = Array.from({length: stepCount + 1}, (_, k) => minDate + k * step);
    ticks[stepCount] += lastStepFix;

    const maxValue = Math.max(...usedData.data.map(p => p.value));
    const topValue = Math.ceil(10 * maxValue) / 10;
    const horizontalTicks = Array.from({length: topValue / 0.2 + 1}, (_, k) => 0.2 * k);
    const tooltip = 'Recent - shows the winrate from the most recent 30 games';
    return (
        <>
            <Box my='2' width='fit-content'>
                <Flex gap='1' align='center'>
                    <SegmentedControl.Root value={seriesUsed} size='1' onValueChange={(value) => {
                        setSeriesUsed(value as SeriesType);
                    }}>
                        <SegmentedControl.Item value='allTime'>All time</SegmentedControl.Item>
                        <SegmentedControl.Item value='recent'>Recent</SegmentedControl.Item>
                    </SegmentedControl.Root>
                    <Dialog.Root>
                        <Tooltip content={tooltip}>
                            <Dialog.Trigger>
                                <InfoCircledIcon/>
                            </Dialog.Trigger>
                        </Tooltip>
                        <Dialog.Content maxWidth='fit-content'>
                            <Text as='div' align='center'>{tooltip}</Text>
                        </Dialog.Content>
                    </Dialog.Root>
                </Flex>
            </Box>
            <ResponsiveContainer width='100%' height='100%' minHeight='200px'>
                <LineChart>
                    <CartesianGrid vertical={false} horizontalValues={horizontalTicks} strokeWidth={1}
                                   strokeDasharray='5 5'/>
                    <XAxis
                        dataKey='date'
                        type='number'
                        allowDuplicatedCategory={false} // without this active data point detection breaks ¯\_(ツ)_/¯
                        ticks={ticks}
                        domain={[minDate, maxDate]}
                        padding={{left: 20, right: 20}}
                        tickFormatter={(tickItem: number) => {
                            return new Date(tickItem).toLocaleDateString();
                        }}/>
                    <YAxis ticks={horizontalTicks} dataKey='value' domain={[0, topValue]}
                           tickFormatter={(tickItem: number) => toPercentage(tickItem)}/>
                    <GraphTooltip formatter={(value: number, _) => toPercentage(value)}
                                  filterNull={true}
                                  contentStyle={{background: 'var(--gray-2)'}}
                                  labelFormatter={(label: number, _) => format(new Date(label), "dd/MM/yyyy")}/>
                    <Line type='monotone' dataKey='value' data={usedData.data} name={usedData.name}
                          key={usedData.name}
                          dot={false} strokeWidth={2}/>
                </LineChart>
            </ResponsiveContainer>
        </>);
}

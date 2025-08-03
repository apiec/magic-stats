import {useEffect, useMemo, useState} from 'react';
import {useImmer} from 'use-immer';
import {useLocation} from 'react-router-dom';
import {Box, Flex, Select, Spinner, Text} from '@radix-ui/themes';
import PlayersTable from "./PlayersTable.tsx";
import PlayerApi, {PlayerWithStats} from "./PlayerApi.ts";
import ValueDisplay from "../Shared/ValueDisplay.tsx";
import WinrateGraph, {DataSeries, DataPoint} from "../Shared/WinrateGraph.tsx";
import PlayerForm from "./PlayerForm.tsx";

export default function Players() {
    const [players, setPlayers] = useImmer<PlayerWithStats[] | undefined>(undefined);
    const [slidingWindowSize, setSlidingWindowSize] = useState<string>(startingWindowValue);
    const [podSize, setPodSize] = useState<string>(startingPodSizeValue);
    const [rerender, setRerender] = useState<number>(0);
    const query = useQuery();
    const playersFromQuery = query.getAll('playerIds');
    const lastX = slidingWindowOptions.get(slidingWindowSize) ?? 10;

    useEffect(() => {
        populatePlayerData().then();
    }, [slidingWindowSize, podSize, query, rerender]);

    async function populatePlayerData() {
        const api = new PlayerApi();
        const players = playersFromQuery.length > 0
            ? await api.getStatsForPod(playersFromQuery, lastX)
            : await api.getAllWithStats(lastX, podSizeOptions.get(podSize));
        setPlayers(() => players);
    }

    if (players === undefined) {
        return <Spinner/>;
    }

    const mostGames = Math.max(...players.map(p => p.stats.games));
    const mostGamesPlayer = players.find(p => p.stats.games === mostGames)!;
    const highestWinrate = Math.max(...players.map(p => p.stats.winrate));
    const highestWinratePlayer = players.find(p => p.stats.winrate === highestWinrate)!;
    const highestWinrateLast = Math.max(...players.map(p => p.stats.winrateLastX));
    const highestWinratePlayerLast = players.find(p => p.stats.winrateLastX === highestWinrateLast)!;

    return (
        <Flex direction='column' maxWidth='700px' align='center' gap='6'>
            <Flex direction={{initial: 'column', md: 'row'}} gap='5'>
                <ValueDisplay title='Most games' values={[mostGamesPlayer.name, mostGames.toFixed(0)]}/>
                <ValueDisplay title='Highest WR'
                              values={[highestWinratePlayer.name, toPercentage(highestWinrate)]}/>
                <ValueDisplay title={'Highest WRL' + lastX}
                              values={[highestWinratePlayerLast.name, toPercentage(highestWinrateLast)]}/>
            </Flex>
            <Flex direction='row' align='start' gap='5' justify='center'>
                <Flex direction='column' minWidth='70px' align='center'>
                    <Text>Sliding window:</Text>
                    <Select.Root value={slidingWindowSize} onValueChange={setSlidingWindowSize}>
                        <Select.Trigger/>
                        <Select.Content>
                            {Array.from(slidingWindowOptions.keys()).map((v, i) => <Select.Item key={i} value={v}>{v}</Select.Item>)}
                        </Select.Content>
                    </Select.Root>
                </Flex>
                <Flex direction='column' minWidth='70px' align='center'>
                    <Text>Pod size:</Text>
                    <Select.Root value={podSize} onValueChange={setPodSize}>
                        <Select.Trigger/>
                        <Select.Content>
                            {Array.from(podSizeOptions.keys()).map(((v, i) => <Select.Item key={i} value={v}>{v}</Select.Item>))}
                        </Select.Content>
                    </Select.Root>
                </Flex>
                <Box>
                    <Text>Add a new player:</Text>
                    <PlayerForm onSubmit={p => {
                        const api = new PlayerApi();
                        api.create(p.name).then(_ => {
                            setRerender(rerender + 1);
                        });
                    }}/>
                </Box>
            </Flex>
            <PlayersTable players={players} lastXWindowSize={lastX}/>
            <PlayersWinrateGraph
                slidingWindowSize={slidingWindowOptions.get(slidingWindowSize)}
                podSize={podSizeOptions.get(podSize)}
                playerIds={playersFromQuery}/>
        </Flex>
    );
}

function useQuery() {
    const {search} = useLocation();
    return useMemo(() => new URLSearchParams(search), [search]);
}

const windowValues = [undefined, 5, 10, 20, 50,];

const slidingWindowOptions: Map<string, number | undefined> = new Map<string, number | undefined>();
windowValues.forEach(v => slidingWindowOptions.set(v ? v.toString() : 'None', v));
const startingWindowValue = 'None';

const podSizeValues = [undefined, 3, 4, 5, 6,];
const podSizeOptions: Map<string, number | undefined> = new Map<string, number | undefined>();
podSizeValues.forEach(v => podSizeOptions.set(v ? v.toString() : 'None', v));
const startingPodSizeValue = 'None';

type PlayersWinrateGraphProps = {
    slidingWindowSize: number | undefined;
    podSize: number | undefined;
    playerIds: string[];
}

function PlayersWinrateGraph({slidingWindowSize, podSize, playerIds}: PlayersWinrateGraphProps) {
    const [data, setData] = useState<DataSeries[]>([]);

    async function populateData() {
        const api = new PlayerApi();
        const playerWinrates = playerIds.length > 0
            ? await api.getWinratesForPod(playerIds, slidingWindowSize)
            : await api.getWinrates(slidingWindowSize, podSize);
        const data = playerWinrates.map(p => {
            return {
                name: p.name,
                data: p.dataPoints.map(d => {
                    return {
                        date: new Date(d.date).valueOf(),
                        value: d.winrate,
                    } as DataPoint;
                })
            } as DataSeries;
        });
        setData(data);
    }

    useEffect(() => {
        populateData().then();
    }, [slidingWindowSize, podSize, playerIds]);

    return (
        <WinrateGraph data={data} slidingWindowSize={slidingWindowSize}/>
    );
}

function toPercentage(num: number): string {
    return (100 * num).toFixed(0) + '%'
}
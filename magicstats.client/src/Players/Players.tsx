import {useEffect, useMemo, useState} from 'react';
import {useImmer} from 'use-immer';
import {useLocation} from 'react-router-dom';
import {Button, Dialog, Flex, Heading, Select, Spinner, Switch, Text} from '@radix-ui/themes';
import PlayersTable from "./PlayersTable.tsx";
import PlayerApi, {PlayerWithStats} from "./PlayerApi.ts";
import ValueDisplay from "../Shared/ValueDisplay.tsx";
import {DataSeries, DataPoint, DataSeriesGraph} from "../Shared/DataSeriesGraph.tsx";
import PlayerForm from "./PlayerForm.tsx";
import {toPercentage} from "../Shared/toPercentage.ts";

export default function Players() {
    const [showGuests, setShowGuests] = useState<boolean>(false);
    const [players, setPlayers] = useImmer<PlayerWithStats[] | undefined>(undefined);
    const [slidingWindowSize, setSlidingWindowSize] = useState<string>(startingWindowValue);
    const [podSize, setPodSize] = useState<string>(startingPodSizeValue);
    const query = useQuery();
    const playersFromQuery = query.getAll('playerIds');
    const lastX = slidingWindowOptions.get(slidingWindowSize) ?? 10;

    useEffect(() => {
        populatePlayerData().then();
    }, [slidingWindowSize, podSize, query]);

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

    const filteredPlayers = players.filter(p => showGuests || !p.isGuest);
    const mostGames = Math.max(...filteredPlayers.map(p => p.stats.games));
    const mostGamesPlayer = filteredPlayers.find(p => p.stats.games === mostGames)!;
    const highestWinrate = Math.max(...filteredPlayers.map(p => p.stats.winrate));
    const highestWinratePlayer = filteredPlayers.find(p => p.stats.winrate === highestWinrate)!;
    const highestWinrateLast = Math.max(...filteredPlayers.map(p => p.stats.winrateLastX));
    const highestWinratePlayerLast = filteredPlayers.find(p => p.stats.winrateLastX === highestWinrateLast)!;

    return (
        <Flex direction='column' align='center' gap='6'>
            <Flex direction='row' gap='5'>
                <ValueDisplay title='Most games' values={[mostGamesPlayer.name, mostGames.toFixed(0)]}/>
                <ValueDisplay title='Highest WR'
                              values={[highestWinratePlayer.name, toPercentage(highestWinrate)]}/>
                <ValueDisplay title={'Highest WRL' + lastX}
                              values={[highestWinratePlayerLast.name, toPercentage(highestWinrateLast)]}/>
            </Flex>
            <Flex direction='row' gap='5' align='end'>
                <Flex direction='row' align='center' gap='2'>
                    <Text>Show guests</Text>
                    <Switch checked={showGuests} onClick={() => setShowGuests(!showGuests)} size='3'/>
                </Flex>
                <Flex direction='column' minWidth='70px' align='center'>
                    <Text>Sliding window</Text>
                    <Select.Root value={slidingWindowSize} onValueChange={setSlidingWindowSize}>
                        <Select.Trigger/>
                        <Select.Content>
                            {Array.from(slidingWindowOptions.keys()).map(
                                (v, i) => <Select.Item key={i} value={v}>{v}</Select.Item>)}
                        </Select.Content>
                    </Select.Root>
                </Flex>
                <Flex direction='column' minWidth='70px' align='center'>
                    <Text>Pod size</Text>
                    <Select.Root value={podSize} onValueChange={setPodSize}>
                        <Select.Trigger/>
                        <Select.Content>
                            {Array.from(podSizeOptions.keys()).map(
                                (v, i) => <Select.Item key={i} value={v}>{v}</Select.Item>)}
                        </Select.Content>
                    </Select.Root>
                </Flex>
                <AddPlayerDialog/>
            </Flex>
            <PlayersTable players={filteredPlayers} lastXWindowSize={lastX}/>
            <PlayersWinrateGraph
                slidingWindowSize={slidingWindowOptions.get(slidingWindowSize)}
                podSize={podSizeOptions.get(podSize)}
                playerIds={playersFromQuery}
                showGuests={showGuests}/>
        </Flex>
    );
}

function useQuery() {
    const {search} = useLocation();
    return useMemo(() => new URLSearchParams(search), [search]);
}

const windowValues = [undefined, 10, 20, 30, 50, 100];

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
    showGuests: boolean;
}
type PlayerDataSeries = DataSeries & {
    isGuest: boolean;
}

function PlayersWinrateGraph({slidingWindowSize, podSize, playerIds, showGuests}: PlayersWinrateGraphProps) {
    const [data, setData] = useState<PlayerDataSeries[]>([]);

    async function populateData() {
        const api = new PlayerApi();
        const playerWinrates = playerIds.length > 0
            ? await api.getWinratesForPod(playerIds, slidingWindowSize)
            : await api.getWinrates(slidingWindowSize, podSize);
        const data = playerWinrates
            .map(p => {
                return {
                    name: p.name,
                    isGuest: p.isGuest,
                    data: p.dataPoints.map(d => {
                        return {
                            date: new Date(d.date).valueOf(),
                            value: d.winrate,
                        } as DataPoint;
                    })
                } as PlayerDataSeries;
            });
        setData(data);
    }

    useEffect(() => {
        populateData().then();
    }, [slidingWindowSize, podSize, playerIds]);

    const filteredData = data.filter(d => showGuests || !d.isGuest);
    return (
        <Flex direction='column' align='center' width='100%'>
            <Heading as='h3'>Winrates</Heading>
            <Text>{slidingWindowSize ? `Sliding window - ${slidingWindowSize}` : 'All time'}</Text>
            <DataSeriesGraph data={filteredData} width='100%' height='400px'/>
        </Flex>
    );
}

function AddPlayerDialog() {
    const [open, setOpen] = useState<boolean>(false);
    return <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger>
            <Button>
                Add a new player
            </Button>
        </Dialog.Trigger>
        <Dialog.Content maxWidth='300px'>
            <Dialog.Title>
                Add a new player
            </Dialog.Title>
            <PlayerForm onSubmit={p => {
                const api = new PlayerApi();
                api.create(p.name, p.isGuest).then(() => {
                    setOpen(false);
                });
            }}/>
        </Dialog.Content>
    </Dialog.Root>
}

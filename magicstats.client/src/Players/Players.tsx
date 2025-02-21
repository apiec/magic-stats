import {useEffect, useMemo, useState} from 'react';
import './Players.css'
import PlayersTable from "./PlayersTable.tsx";
import PlayerApi, {PlayerWithStats} from "./PlayerApi.ts";
import ValueDisplay from "../Shared/ValueDisplay.tsx";
import {useImmer} from 'use-immer';
import Select from "react-select";
import WinrateGraph, {DataSeries, DataPoint} from "../Shared/WinrateGraph.tsx";
import {useLocation} from 'react-router-dom';
import PlayerForm from "./PlayerForm.tsx";

export default function Players() {
    const [players, setPlayers] = useImmer<PlayerWithStats[] | undefined>(undefined);
    const [slidingWindowSize, setSlidingWindowSize] = useState<number | undefined>(startingWindowValue);
    const [podSize, setPodSize] = useState<number | undefined>(startingPodSizeValue);
    const [rerender, setRerender] = useState<number>(0);
    const query = useQuery();
    const playersFromQuery = query.getAll('playerIds');
    const lastX = slidingWindowSize ?? 10;

    useEffect(() => {
        populatePlayerData().then();
    }, [slidingWindowSize, podSize, query, rerender]);

    async function populatePlayerData() {
        const api = new PlayerApi();
        const players = playersFromQuery.length > 0
            ? await api.getStatsForPod(playersFromQuery, lastX)
            : await api.getAllWithStats(lastX, podSize);
        setPlayers(() => players);
    }

    if (players === undefined) {
        return <p>Loading...</p>;
    }

    const mostGames = Math.max(...players.map(p => p.stats.games));
    const mostGamesPlayer = players.find(p => p.stats.games === mostGames)!;
    const highestWinrate = Math.max(...players.map(p => p.stats.winrate));
    const highestWinratePlayer = players.find(p => p.stats.winrate === highestWinrate)!;
    const highestWinrateLast = Math.max(...players.map(p => p.stats.winrateLastX));
    const highestWinratePlayerLast = players.find(p => p.stats.winrateLastX === highestWinrateLast)!;

    return (
        <section className='players-section'>
            <section className='players-section-values'>
                <ValueDisplay title='Most games' values={[mostGamesPlayer.name, mostGames.toFixed(0)]}/>
                <ValueDisplay title='Highest WR'
                              values={[highestWinratePlayer.name, toPercentage(highestWinrate)]}/>
                <ValueDisplay title={'Highest WRL' + lastX}
                              values={[highestWinratePlayerLast.name, toPercentage(highestWinrateLast)]}/>
            </section>
            <section className='players-controls'>
                <div>
                    <p>Sliding window:</p>
                    <Select className='black-text'
                            options={slidingWindowOptions}
                            value={slidingWindowOptions.find(o => o.value === slidingWindowSize)}
                            onChange={(x) => {
                                setSlidingWindowSize(x?.value);
                            }}/>
                </div>
                <div>
                    <p>Pod size:</p>
                    <Select isDisabled={playersFromQuery.length > 0}
                            className='black-text'
                            options={podSizeOptions}
                            value={podSizeOptions.find(o => o.value === (playersFromQuery.length > 0 ? playersFromQuery.length : podSize))}
                            onChange={(x) => {
                                setPodSize(x?.value);
                            }}/>
                </div>
                <div>
                    <p>Add a new player:</p>
                    <PlayerForm onSubmit={p => {
                        const api = new PlayerApi();
                        api.create(p.name).then(_ => {
                            setRerender(rerender + 1);
                        });
                    }}/>
                </div>
            </section>
            <PlayersTable players={players} lastXWindowSize={lastX}/>
            <PlayersWinrateGraph slidingWindowSize={slidingWindowSize} podSize={podSize} playerIds={playersFromQuery}/>
        </section>
    );
}

function useQuery() {
    const {search} = useLocation();
    return useMemo(() => new URLSearchParams(search), [search]);
}

const windowValues = [undefined, 5, 10, 20, 50,];

const slidingWindowOptions = windowValues.map(v => {
    return {
        label: v ? v.toString() : 'None',
        value: v,
    }
});
const startingWindowValue = undefined;

const podSizeValues = [undefined, 3, 4, 5, 6,];

const podSizeOptions = podSizeValues.map(v => {
    return {
        label: v ? v.toString() : 'None',
        value: v,
    }
});
const startingPodSizeValue = undefined;

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
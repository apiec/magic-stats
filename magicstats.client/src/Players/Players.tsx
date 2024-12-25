import {useEffect, useState} from 'react';
import './Players.css'
import PlayersTable from "./PlayersTable.tsx";
import PlayerApi, {PlayerWithStats} from "./PlayerApi.ts";
import ValueDisplay from "../Shared/ValueDisplay.tsx";
import {useImmer} from 'use-immer';
import Select from "react-select";
import WinrateGraph, {DataSeries, DataPoint} from "../Shared/WinrateGraph.tsx";

export default function Players() {
    const [players, setPlayers] = useImmer<PlayerWithStats[] | undefined>(undefined);
    const [slidingWindowSize, setSlidingWindowSize] = useState<number | undefined>(startingWindowValue);
    const lastX = slidingWindowSize ?? 10;

    useEffect(() => {
        populatePlayerData().then();
    }, [slidingWindowSize]);

    async function populatePlayerData() {
        const api = new PlayerApi();
        const players = await api.getAllWithStats(lastX);
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
            <div className='sliding-window-pick'>
                <p>Sliding window:</p>
                <Select className='black-text' options={options}
                        value={options.find(o => o.value === slidingWindowSize)}
                        onChange={(x) => {
                            setSlidingWindowSize(x?.value);
                        }}/>
            </div>
            <PlayersTable players={players} lastXWindowSize={lastX}/>
            <PlayersWinrateGraph slidingWindowSize={slidingWindowSize}/>
        </section>
    );
}

const windowValues = [
    undefined,
    5,
    10,
    20,
    50,
];

const options = windowValues.map(v => {
    return {
        label: v ? v.toString() : 'None',
        value: v,
    }
});
const startingWindowValue = undefined;


type PlayersWinrateGraphProps = {
    slidingWindowSize: number | undefined;
}

function PlayersWinrateGraph({slidingWindowSize}: PlayersWinrateGraphProps) {
    const [data, setData] = useState<DataSeries[]>([]);

    async function populateData() {
        const api = new PlayerApi();
        const playerWinrates = await api.getWinrates(slidingWindowSize);
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
    }, [slidingWindowSize]);

    return (
        <WinrateGraph data={data} slidingWindowSize={slidingWindowSize}/>
    );
}

function toPercentage(num: number): string {
    return (100 * num).toFixed(0) + '%'
}
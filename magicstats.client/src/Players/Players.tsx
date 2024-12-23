import {useEffect, useState} from 'react';
import './Players.css'
import PlayersTable from "./PlayersTable.tsx";
import WinrateGraph, {DataPoint, DataSeries} from "./WinrateGraph.tsx";
import PlayerApi, {PlayerWithStats} from "./PlayerApi.ts";
import ValueDisplay from "../Shared/ValueDisplay.tsx";
import {useImmer} from 'use-immer';

export default function Players() {
    const [players, setPlayers] = useImmer<PlayerWithStats[] | undefined>(undefined);

    useEffect(() => {
        populatePlayerData().then();
    }, []);

    async function populatePlayerData() {
        const api = new PlayerApi();
        const players = await api.getAllWithStats();
        setPlayers(() => players);
    }

    if (players === undefined) {
        return <p>Loading...</p>;
    }

    const mostGames = Math.max(...players.map(p => p.stats.games));
    const mostGamesPlayer = players.find(p => p.stats.games === mostGames)!;
    const highestWinrate = Math.max(...players.map(p => p.stats.winrate));
    const highestWinratePlayer = players.find(p => p.stats.winrate === highestWinrate)!;
    const highestWinrateL10 = Math.max(...players.map(p => p.stats.winrateLast10));
    const highestWinratePlayerL10 = players.find(p => p.stats.winrateLast10 === highestWinrateL10)!;

    return (
        <section className='players-section'>
            <section className='players-section-values'>
                <ValueDisplay title='Most games' values={[mostGamesPlayer.name, mostGames.toFixed(0)]}/>
                <ValueDisplay title='Highest WR'
                              values={[highestWinratePlayer.name, toPercentage(highestWinrate)]}/>
                <ValueDisplay title='Highest WRL10'
                              values={[highestWinratePlayerL10.name, toPercentage(highestWinrateL10)]}/>
            </section>
            <PlayersTable players={players}/>
            <PlayersWinrateGraph/>
        </section>
    );
}


function PlayersWinrateGraph() {
    const [data, setData] = useState<DataSeries[]>([]);

    async function populateData() {
        const api = new PlayerApi();
        const playerWinrates = await api.getWinrates();
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
    }, []);

    return <WinrateGraph data={data}/>
}

function toPercentage(num: number): string {
    return (100 * num).toFixed(0) + '%'
}

import {useEffect, useState} from 'react';
import './Players.css'
import PlayersTable from "./PlayersTable.tsx";
import WinrateGraph, {DataPoint, DataSeries} from "./WinrateGraph.tsx";
import PlayerApi from "./PlayerApi.ts";

export default function Players() {
    return (
        <section className='players-section'>
            <PlayersTable/>
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
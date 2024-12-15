﻿import {useEffect, useState} from "react";
import "./HomePage.css";
import Api from "../api/Api.ts";

export default function HomePage() {

    const [stats, setStats] = useState<Stats>();

    async function populateStatsData() {
        const api = new Api();
        const data = await api.get<Stats>('/home/stats');
        setStats(data);
    }

    useEffect(() => {
        populateStatsData().then();
    }, []);

    if (stats === undefined) {
        return <>Loading...</>;
    }
    return (
        <div className='home-page'>
            <div className='home-page-values-container'>
                <ValueDisplay title='Total games' values={[stats.gamesTotal.toFixed(0)]}/>
                <ValueDisplay title='Total meetings' values={[stats.meetings.toFixed(0)]}/>
                <ValueDisplay title='Games per meeting' values={[stats.gamesPerMeeting.toFixed(1)]}/>
                <ValueDisplay
                    title='Most games'
                    values={[stats.mostGamesPlayer.name, stats.mostGamesPlayer.gamesPlayed.toFixed(0)]}/>
                <ValueDisplay
                    title='Most played'
                    values={[stats.mostGamesCommander.name, stats.mostGamesCommander.gamesPlayed.toFixed(0)]}/>
            </div>
        </div>
    );
}

type ValueDisplayProps = {
    title: string,
    values: string[],
}

function ValueDisplay({title, values}: ValueDisplayProps) {
    return (
        <div className='value-display'>
            <p className='value-display-title'>{title}</p>
            <div className='value-display-values-container'>
                {values.map((v, i) =>
                    <p key={i} className='value-display-value'>{v}</p>
                )}
            </div>
        </div>
    );
}

type Stats = {
    gamesTotal: number,
    meetings: number,
    gamesPerMeeting: number,
    mostGamesPlayer: {
        id: number,
        name: string,
        gamesPlayed: number,
    }
    mostGamesCommander: {
        id: number,
        name: string,
        gamesPlayed: number,
    }
}
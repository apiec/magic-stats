﻿import {useEffect, useState} from "react";
import "./HomePage.css";
import Api from "../api/Api.ts";
import ValueDisplay from "../Shared/ValueDisplay.tsx";

export default function HomePage() {

    const [stats, setStats] = useState<Stats>();

    async function populateStatsData() {
        const api = new Api();
        const data = await api.get<Stats>('home/stats');
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

type Stats = {
    gamesTotal: number,
    meetings: number,
    gamesPerMeeting: number,
    mostGamesPlayer: {
        id: string,
        name: string,
        gamesPlayed: number,
    }
    mostGamesCommander: {
        id: string,
        name: string,
        gamesPlayed: number,
    }
}

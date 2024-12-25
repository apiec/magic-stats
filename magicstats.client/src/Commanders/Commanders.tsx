import './Commanders.css'
import CommanderApi, {CommanderWithStats} from "./CommanderApi.ts";
import {useEffect, useState} from 'react';
import {useImmer} from 'use-immer';
import CommandersTable from "./CommandersTable.tsx";
import WinrateGraph, {DataPoint, DataSeries} from "../Shared/WinrateGraph.tsx";
import ValueDisplay from "../Shared/ValueDisplay.tsx";
import Select from "react-select";

export default function Commanders() {
    const [commanders, setCommanders] = useImmer<CommanderWithStats[] | undefined>(undefined);
    const [slidingWindowSize, setSlidingWindowSize] = useState<number | undefined>(startingWindowValue);
    const lastX = slidingWindowSize ?? 10;

    useEffect(() => {
        populateCommanderData().then();
    }, [slidingWindowSize]);

    async function populateCommanderData() {
        const api = new CommanderApi();
        const commanders = await api.getAllWithStats(lastX);
        setCommanders(() => commanders);
    }

    if (commanders === undefined) {
        return <p>Loading...</p>;
    }

    const mostGames = Math.max(...commanders.map(p => p.stats.games));
    const mostGamesCommander = commanders.find(p => p.stats.games === mostGames)!;
    const highestWinrate = Math.max(...commanders.map(p => p.stats.winrate));
    const highestWinrateCommander = commanders.find(p => p.stats.winrate === highestWinrate)!;
    const highestWinrateLast = Math.max(...commanders.map(p => p.stats.winrateLastX));
    const highestWinrateCommanderLast = commanders.find(p => p.stats.winrateLastX === highestWinrateLast)!;

    return (
        <section className='commanders-section'>
            <section className='commanders-section-values'>
                <ValueDisplay title='Most games' values={[mostGamesCommander.name, mostGames.toFixed(0)]}/>
                <ValueDisplay title='Highest WR'
                              values={[highestWinrateCommander.name, toPercentage(highestWinrate)]}/>
                <ValueDisplay title={'Highest WRL' + lastX}
                              values={[highestWinrateCommanderLast.name, toPercentage(highestWinrateLast)]}/>
            </section>
            <div className='sliding-window-pick'>
                <p>Sliding window:</p>
                <Select className='black-text' options={options}
                        value={options.find(o => o.value === slidingWindowSize)}
                        onChange={(x) => {
                            setSlidingWindowSize(x?.value);
                        }}/>
            </div>
            <CommandersTable commanders={commanders} lastXWindowSize={lastX}/>
            <CommandersWinrateGraph slidingWindowSize={slidingWindowSize}/>
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


type CommandersWinrateGraphProps = {
    slidingWindowSize: number | undefined;
}

function CommandersWinrateGraph({slidingWindowSize}: CommandersWinrateGraphProps) {
    const [data, setData] = useState<DataSeries[]>([]);

    async function populateData() {
        const api = new CommanderApi();
        const commanderWinrates = await api.getWinrates(slidingWindowSize);
        const data = commanderWinrates.map(p => {
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
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
    const [podSize, setPodSize] = useState<number | undefined>(startingPodSizeValue);
    const lastX = slidingWindowSize ?? 10;

    useEffect(() => {
        populateCommanderData().then();
    }, [slidingWindowSize, podSize]);

    async function populateCommanderData() {
        const api = new CommanderApi();
        const commanders = await api.getAllWithStats(lastX, podSize);
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
                    <Select className='black-text'
                            options={podSizeOptions}
                            value={podSizeOptions.find(o => o.value === podSize)}
                            onChange={(x) => {
                                setPodSize(x?.value);
                            }}/>
                </div>
            </section>
            <CommandersTable commanders={commanders} lastXWindowSize={lastX}/>
            <CommandersWinrateGraph slidingWindowSize={slidingWindowSize} podSize={podSize}/>
        </section>
    );
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


type CommandersWinrateGraphProps = {
    slidingWindowSize: number | undefined;
    podSize: number | undefined;
}

function CommandersWinrateGraph({slidingWindowSize, podSize}: CommandersWinrateGraphProps) {
    const [data, setData] = useState<DataSeries[]>([]);

    async function populateData() {
        const api = new CommanderApi();
        const commanderWinrates = await api.getWinrates(slidingWindowSize, podSize);
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
    }, [slidingWindowSize, podSize]);

    return (
        <WinrateGraph data={data} slidingWindowSize={slidingWindowSize}/>
    );
}

function toPercentage(num: number): string {
    return (100 * num).toFixed(0) + '%'
}
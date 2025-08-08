import {useEffect, useState} from 'react';
import {useImmer} from 'use-immer';
import {Box, Flex, Select, Spinner, Text} from '@radix-ui/themes';
import CommanderApi, {CommanderWithStats} from "./CommanderApi.ts";
import CommanderForm from "./CommanderForm.tsx";
import CommandersTable from "./CommandersTable.tsx";
import WinrateGraph, {DataPoint, DataSeries} from "../Shared/WinrateGraph.tsx";
import ValueDisplay from "../Shared/ValueDisplay.tsx";

export default function Commanders() {
    const [commanders, setCommanders] = useImmer<CommanderWithStats[] | undefined>(undefined);
    const [slidingWindowSize, setSlidingWindowSize] = useState<string>(startingWindowValue);
    const [podSize, setPodSize] = useState<string>(startingPodSizeValue);
    const [rerender, setRerender] = useState<number>(0);
    const lastX = slidingWindowOptions.get(slidingWindowSize) ?? 10;

    useEffect(() => {
        populateCommanderData().then();
    }, [slidingWindowSize, podSize, rerender]);

    async function populateCommanderData() {
        const api = new CommanderApi();
        const commanders = await api.getAllWithStats(lastX, podSizeOptions.get(podSize));
        setCommanders(() => commanders);
    }

    if (commanders === undefined) {
        return <Spinner/>;
    }

    const mostGames = Math.max(...commanders.map(p => p.stats.games));
    const mostGamesCommander = commanders.find(p => p.stats.games === mostGames)!;
    const highestWinrate = Math.max(...commanders.map(p => p.stats.winrate));
    const highestWinrateCommander = commanders.find(p => p.stats.winrate === highestWinrate)!;
    const highestWinrateLast = Math.max(...commanders.map(p => p.stats.winrateLastX));
    const highestWinrateCommanderLast = commanders.find(p => p.stats.winrateLastX === highestWinrateLast)!;

    return (
        <Flex direction='column' maxWidth='700px' align='center' gap='6'>
            <Flex direction={{initial: 'column', md: 'row'}} gap='5'>
                <ValueDisplay title='Most games' values={[mostGamesCommander.name, mostGames.toFixed(0)]}/>
                <ValueDisplay title='Highest WR'
                              values={[highestWinrateCommander.name, toPercentage(highestWinrate)]}/>
                <ValueDisplay title={'Highest WRL' + lastX}
                              values={[highestWinrateCommanderLast.name, toPercentage(highestWinrateLast)]}/>
            </Flex>
            <Flex direction='row' align='start' gap='5' justify='center'>
                <Flex direction='column' minWidth='70px' align='center'>
                    <Text>Sliding window:</Text>
                    <Select.Root value={slidingWindowSize} onValueChange={setSlidingWindowSize}>
                        <Select.Trigger/>
                        <Select.Content>
                            {Array.from(slidingWindowOptions.keys()).map(v => <Select.Item value={v}>{v}</Select.Item>)}
                        </Select.Content>
                    </Select.Root>
                </Flex>
                <Flex direction='column' minWidth='70px' align='center'>
                    <Text>Pod size:</Text>
                    <Select.Root value={podSize} onValueChange={setPodSize}>
                        <Select.Trigger/>
                        <Select.Content>
                            {Array.from(podSizeOptions.keys()).map(v => <Select.Item value={v}>{v}</Select.Item>)}
                        </Select.Content>
                    </Select.Root>
                </Flex>
                <Box>
                    <Text>Add a new commander:</Text>
                    <CommanderForm onSubmit={p => {
                        const api = new CommanderApi();
                        api.create(p.name).then(_ => {
                            setRerender(rerender + 1);
                        });
                    }}/>
                </Box>
            </Flex>
            <CommandersTable commanders={commanders} lastXWindowSize={lastX}/>
            <CommandersWinrateGraph
                slidingWindowSize={slidingWindowOptions.get(slidingWindowSize)}
                podSize={podSizeOptions.get(podSize)}/>
        </Flex>
    );
}

const windowValues = [undefined, 10, 20, 30, 50, 100];

const slidingWindowOptions: Map<string, number | undefined> = new Map<string, number | undefined>();
windowValues.forEach(v => slidingWindowOptions.set(v ? v.toString() : 'None', v));
const startingWindowValue = 'None';

const podSizeValues = [undefined, 3, 4, 5, 6,];
const podSizeOptions: Map<string, number | undefined> = new Map<string, number | undefined>();
podSizeValues.forEach(v => podSizeOptions.set(v ? v.toString() : 'None', v));
const startingPodSizeValue = 'None';


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
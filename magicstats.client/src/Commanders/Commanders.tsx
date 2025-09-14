import {useEffect, useState} from 'react';
import {useImmer} from 'use-immer';
import {Button, Dialog, Flex, Select, Spinner, Text} from '@radix-ui/themes';
import CommanderApi, {CommanderWithStats} from "./CommanderApi.ts";
import CommanderForm from "./CommanderForm.tsx";
import CommandersTable from "./CommandersTable.tsx";
import ValueDisplay from "../Shared/ValueDisplay.tsx";
import {toPercentage} from "../Shared/toPercentage.ts";

export default function Commanders() {
    const [commanders, setCommanders] = useImmer<CommanderWithStats[] | undefined>(undefined);
    const [slidingWindowSize, setSlidingWindowSize] = useState<string>(startingWindowValue);
    const [podSize, setPodSize] = useState<string>(startingPodSizeValue);
    const lastX = slidingWindowOptions.get(slidingWindowSize) ?? 10;

    useEffect(() => {
        populateCommanderData().then();
    }, [slidingWindowSize, podSize]);

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

    return (
        <Flex direction='column' maxWidth='700px' align='center' gap='6'>
            <Flex direction={{initial: 'column', md: 'row'}} gap='5'>
                <ValueDisplay title='Most games'
                              values={[mostGamesCommander.commander.displayName, mostGames.toFixed(0)]}/>
                <ValueDisplay title='Highest WR'
                              values={[highestWinrateCommander.commander.displayName, toPercentage(highestWinrate)]}/>
            </Flex>
            <Flex direction='row' align='end' gap='5' justify='center'>
                <Flex direction='column' minWidth='70px' align='center'>
                    <Text>Sliding window:</Text>
                    <Select.Root value={slidingWindowSize} onValueChange={setSlidingWindowSize}>
                        <Select.Trigger/>
                        <Select.Content>
                            {Array.from(slidingWindowOptions.keys())
                                .map(v => <Select.Item key={v} value={v}>{v}</Select.Item>)}
                        </Select.Content>
                    </Select.Root>
                </Flex>
                <Flex direction='column' minWidth='70px' align='center'>
                    <Text>Pod size:</Text>
                    <Select.Root value={podSize} onValueChange={setPodSize}>
                        <Select.Trigger/>
                        <Select.Content>
                            {Array.from(podSizeOptions.keys())
                                .map(v => <Select.Item key={v} value={v}>{v}</Select.Item>)}
                        </Select.Content>
                    </Select.Root>
                </Flex>
                <AddCommanderDialog/>
            </Flex>
            <CommandersTable commanders={commanders} lastXWindowSize={lastX}/>
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

function AddCommanderDialog() {
    const [open, setOpen] = useState<boolean>(false);
    return <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger>
            <Button>
                Add a new commander
            </Button>
        </Dialog.Trigger>
        <Dialog.Content maxWidth='300px'>
            <Dialog.Title>
                Add a new commander
            </Dialog.Title>
            <CommanderForm
                loading={false}
                onClose={() => setOpen(false)}
                onSubmit={c => {
                    const api = new CommanderApi();
                    api.create(c).then(() => {
                        setOpen(false);
                    });
                }}/>
        </Dialog.Content>
    </Dialog.Root>
}
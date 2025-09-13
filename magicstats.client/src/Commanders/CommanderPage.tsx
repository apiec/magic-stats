import {useEffect, useState} from "react";
import CommanderApi, {
    Commander,
    Card,
    SingleCommanderWithStats,
    CommanderImageUris,
    CommanderWithWinrates
} from "./CommanderApi.ts";
import {useParams} from "react-router-dom";
import {
    Box,
    Card as RadixCard,
    Dialog,
    Flex,
    HoverCard,
    IconButton,
    Inset,
    Spinner,
    Text,
    SegmentedControl,
    Tooltip,
    Grid,
    Heading,
    Skeleton
} from "@radix-ui/themes";
import {getCommanderDisplayName} from "./CommanderUtils.ts";
import {InfoCircledIcon, Pencil1Icon} from "@radix-ui/react-icons";
import CommanderForm from "./CommanderForm.tsx";
import {DataPoint, DataSeries, DataSeriesGraph} from "../Shared/DataSeriesGraph.tsx";
import ValueDisplay from "../Shared/ValueDisplay.tsx";
import { toPercentage } from "../Shared/toPercentage.ts";

export function CommanderPage() {
    const {commanderId} = useParams<string>()!;
    const [commander, setCommander] = useState<SingleCommanderWithStats | undefined>();
    useEffect(() => {
        const api = new CommanderApi();
        api.get(commanderId!).then(c => setCommander(c));
    }, [commanderId]);

    if (commander === undefined) {
        return <Flex direction='column' align='center' gap='2'>
            <Text>Loading commander data</Text>
            <Spinner/>
        </Flex>;
    }

    return (
        <Flex direction='column' gap='7' width='100%' align='center' justify='center'>
            <RadixCard>
                <CommanderSummary commander={commander} onCommanderUpdate={(c) => {
                    handleCommanderChange(c)
                        .then(res => setCommander({
                            ...commander,
                            ...res,
                        }));
                }}/>
            </RadixCard>
            <Flex gap='2' align='center' wrap='wrap' maxWidth='500px' justify='center'>
                <ValueDisplay title='Total games' values={[commander.stats.games.toFixed(0)]}/>
                <ValueDisplay title='Total wins' values={[commander.stats.wins.toFixed(0)]}/>
                <ValueDisplay title='All time winrate' values={[toPercentage(commander.stats.winrate)]}/>
            </Flex>
            <Grid gap='7' columns={{initial: '1', md: '2',}}>
                <Box width='360px' maxWidth='90vw' height='300px' asChild>
                    <Flex direction='column'>
                        <Heading>Winrate</Heading>
                        <CommanderWinrateGraph commanderId={commanderId!}/>
                    </Flex>
                </Box>
            </Grid>
        </Flex>
    );
}

type CommanderSummaryCardProps = {
    commander: Commander,
    onCommanderUpdate: (commander: Commander) => void,
}

function CommanderSummary({commander, onCommanderUpdate}: CommanderSummaryCardProps) {
    return (
        <Flex direction={{
            initial: 'column',
            md: 'row',
        }} align='center' gap='3' p='1'>
            <Box asChild>
                <CommanderCardsDisplay commander={commander}/>
            </Box>
            <Flex direction='row' align='center' gap='3' p='1'>
                <Box maxWidth='150px' asChild>
                    <Text align={{
                        initial: 'center',
                        md: 'left',
                    }} as='div' wrap='pretty' size='6'>{getCommanderDisplayName(commander)}</Text>
                </Box>
                <EditCommanderDialog commander={commander} onUpdate={onCommanderUpdate}/>
            </Flex>
        </Flex>
    );
}

type CommanderCardDisplayProps = {
    commander: Commander,
}

export function CommanderCardsDisplay({commander}: CommanderCardDisplayProps) {
    const fallbackCard = {
        name: 'pigeon',
        images: {
            small: "https://cards.scryfall.io/small/front/9/d/9d68befe-78bc-4d9c-968b-f7e6b3042f27.jpg?1562769676",
            normal: "https://cards.scryfall.io/normal/front/9/d/9d68befe-78bc-4d9c-968b-f7e6b3042f27.jpg?1562769676",
            large: "https://cards.scryfall.io/large/front/9/d/9d68befe-78bc-4d9c-968b-f7e6b3042f27.jpg?1562769676",
            png: "https://cards.scryfall.io/png/front/9/d/9d68befe-78bc-4d9c-968b-f7e6b3042f27.png?1562769676",
            artCrop: "https://cards.scryfall.io/art_crop/front/9/d/9d68befe-78bc-4d9c-968b-f7e6b3042f27.jpg?1562769676",
            borderCrop: "https://cards.scryfall.io/border_crop/front/9/d/9d68befe-78bc-4d9c-968b-f7e6b3042f27.jpg?1562769676"
        } as CommanderImageUris,
    } as Card; // pigeon placeholder todo: replace

    return <Flex>
        {!commander.card && <SingleCardDisplay card={fallbackCard}/>}
        {commander.card && <SingleCardDisplay card={commander.card}/>}
        {commander.partner && <SingleCardDisplay card={commander.partner}/>}
    </Flex>;
}

type SingleCardDisplayProps = {
    card: Card,
}

function SingleCardDisplay({card}: SingleCardDisplayProps) {
    const content = () => (
        <Inset>
            <Box width='100%' asChild>
                <img src={card.images.borderCrop} alt={card.name}/>
            </Box>
        </Inset>);

    return <Dialog.Root>
        <HoverCard.Root>
            <HoverCard.Trigger>
                <Dialog.Trigger>
                    <Box asChild
                         maxWidth='200px'
                         style={{
                             borderRadius: 'var(--radius-1)',
                             boxShadow: 'var(--shadow-1)'
                         }}>
                        <img src={card.images.artCrop} alt={card.name + ' art crop'}/>
                    </Box>
                </Dialog.Trigger>
            </HoverCard.Trigger>
            <HoverCard.Content maxWidth='300px'>
                {content()}
            </HoverCard.Content>
        </HoverCard.Root>
        <Dialog.Content>
            <Dialog.Close>
                {content()}
            </Dialog.Close>
        </Dialog.Content>
    </Dialog.Root>
}

type EditCommanderDialogProps = {
    commander: Commander,
    onUpdate: (commander: Commander) => void,
};

function EditCommanderDialog({commander, onUpdate}: EditCommanderDialogProps) {
    const [open, setOpen] = useState<boolean>(false);
    return <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger>
            <IconButton size='1' variant='ghost' radius='small' asChild>
                <Box asChild>
                    <Pencil1Icon/>
                </Box>
            </IconButton>
        </Dialog.Trigger>
        <Dialog.Content maxWidth='300px'>
            <Dialog.Title>
                Edit commander
            </Dialog.Title>
            <CommanderForm
                commander={commander}
                onSubmit={(c) => {
                    onUpdate(c);
                    setOpen(false);
                }}
                onClose={() => setOpen(false)}
            />
        </Dialog.Content>
    </Dialog.Root>;
}

async function handleCommanderChange(commander: Commander): Promise<Commander> {
    const api = new CommanderApi();
    return await api.update(commander);
}

type CommanderWinrateGraphProps = {
    commanderId: string;
}

type SeriesType = 'recent' | 'allTime';

function CommanderWinrateGraph({commanderId}: CommanderWinrateGraphProps) {
    const [recentData, setRecentData] = useState<DataSeries | undefined>(undefined);
    const [allTimeData, setAllTimeData] = useState<DataSeries | undefined>(undefined);
    const [seriesUsed, setSeriesUsed] = useState<SeriesType>('recent');

    function mapData(data: CommanderWithWinrates[]): DataSeries {
        const commanderData = data.find(d => d.id === commanderId)!;
        return {
            name: commanderData.name,
            data: commanderData.dataPoints.map(d => {
                return {
                    date: new Date(d.date).valueOf(),
                    value: d.winrate,
                } as DataPoint;
            })
        } as DataSeries;
    }

    function populateData() {
        const api = new CommanderApi();
        api.getWinrates(30).then(mapData).then(setRecentData);
        api.getWinrates().then(mapData).then(setAllTimeData);
    }

    useEffect(() => {
        populateData();
    }, []);

    const usedData = seriesUsed === 'recent' ? recentData : allTimeData;
    const tooltip = 'Recent - shows the winrate from the most recent 30 games';
    return (
        <>
            <Box my='2' width='fit-content'>
                <Flex gap='1' align='center'>
                    <SegmentedControl.Root value={seriesUsed} size='1' onValueChange={(value) => {
                        setSeriesUsed(value as SeriesType);
                    }}>
                        <SegmentedControl.Item value='allTime'>All time</SegmentedControl.Item>
                        <SegmentedControl.Item value='recent'>Recent</SegmentedControl.Item>
                    </SegmentedControl.Root>
                    <Dialog.Root>
                        <Tooltip content={tooltip}>
                            <Dialog.Trigger>
                                <InfoCircledIcon/>
                            </Dialog.Trigger>
                        </Tooltip>
                        <Dialog.Content maxWidth='fit-content'>
                            <Text as='div' align='center'>{tooltip}</Text>
                        </Dialog.Content>
                    </Dialog.Root>
                </Flex>
            </Box>
            {
                usedData !== undefined
                    ? <DataSeriesGraph data={[usedData]}/>
                    : <Skeleton width='100%' height='100%'/>
            }
        </>);
}
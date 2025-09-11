import {useEffect, useState} from "react";
import CommanderApi, {Commander, Card, SingleCommanderWithStats, CommanderImageUris} from "./CommanderApi.ts";
import {useParams} from "react-router-dom";
import {Box, Card as RadixCard, Dialog, Flex, HoverCard, IconButton, Inset, Spinner, Text} from "@radix-ui/themes";
import {getCommanderDisplayName} from "./CommanderUtils.ts";
import {Pencil1Icon} from "@radix-ui/react-icons";
import {CommanderCardSearch} from "./CommanderCardSearch.tsx";

export function CommanderPage() {
    const {commanderId} = useParams<string>();
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
        <Flex direction='column' gap='7' align='center'>
            <RadixCard>
                <CommanderSummary commander={commander} onCommanderUpdate={() => {
                }}/>
            </RadixCard>
            {/* todo: value displays for wins/games */}
            <CommanderCardSearch/>
        </Flex>
    );
}

type CommanderSummaryCardProps = {
    commander: Commander,
    onCommanderUpdate: (commander: Commander) => void,
}

function CommanderSummary({commander, onCommanderUpdate}: CommanderSummaryCardProps) {
    return (
        <Flex direction='row' align='center' gap='3' p='1'>
            <Box asChild>
                <CommanderCardsDisplay commander={commander}/>
            </Box>
            <Box maxWidth='140px' asChild>
                <Text as='div' align='left' size='6'>{getCommanderDisplayName(commander)}</Text>
            </Box>
            <EditCommanderDialog commander={commander} onUpdate={onCommanderUpdate}/>
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
                <img src={card.images.png} alt={card.name + ' png'}/>
            </Box>
        </Inset>);

    return <Dialog.Root>
        <HoverCard.Root>
            <HoverCard.Trigger>
                <Dialog.Trigger>
                    <Box maxWidth='200px' asChild
                         style={{borderRadius: 'var(--radius-1)', boxShadow: 'var(--shadow-1)'}}>
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
            {/*<CommanderForm*/}
            {/*    // commander={commander}*/}
            {/*    // onClose={() => setOpen(false)}*/}
            {/*    onSubmit={p => {*/}
            {/*    }}/>*/}
        </Dialog.Content>
    </Dialog.Root>;
}

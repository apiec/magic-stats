import {Commander} from "./CommanderApi";
import {Button, Flex, Grid, TextField} from "@radix-ui/themes";
import {CommanderCardSelect} from "./CommanderCardSelect.tsx";
import {useImmer} from "use-immer";

type CommanderFormProps = {
    commander?: Commander,
    onSubmit: (commander: Commander) => void;
    onClose?: () => void;
}
export default function CommanderForm({commander, onSubmit, onClose}: CommanderFormProps) {
    const [commanderCopy, setCommanderCopy] = useImmer<Commander>(
        commander ?? {name: ''} as Commander);

    return (
        <Flex asChild direction='column' gap='1'>
            <form onSubmit={(e) => {
                e.preventDefault();
                onSubmit(commanderCopy);
            }}>
                {
                    commanderCopy.name && !commanderCopy.card &&
                    <TextField.Root
                        id='name-input'
                        placeholder='Commander name'
                        value={commanderCopy.name}
                        onChange={e => {
                            const name = e.currentTarget.value;
                            setCommanderCopy(c => {
                                c.name = name;
                            });
                        }}>
                    </TextField.Root>
                }
                <CommanderCardSelect
                    card={commanderCopy.card}
                    onCardChange={card => {
                        setCommanderCopy(c => {
                            c.card = card;
                        })
                    }}
                    placeholder={'Find your commander'}
                />
                <CommanderCardSelect
                    card={commanderCopy.partner}
                    onCardChange={card => {
                        setCommanderCopy(c => {
                            c.partner = card;
                        })
                    }}
                    placeholder={'Add a partner'}
                />
                <Grid columns='2' gap='3'>
                    {
                        onClose &&
                        <Button variant='outline' onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}>
                            Cancel
                        </Button>
                    }
                    <Button type='submit'>
                        Confirm
                    </Button>
                </Grid>
            </form>
        </Flex>
    );
}
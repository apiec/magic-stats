import {Commander} from "./CommanderApi";
import {Button, Flex, Grid, Switch, Text, TextField} from "@radix-ui/themes";
import {CommanderCardSelect} from "./CommanderCardSelect.tsx";
import {useImmer} from "use-immer";

type CommanderFormProps = {
    commander?: Commander,
    loading: boolean,
    onSubmit: (commander: Commander) => void;
    onClose?: () => void;
}
export default function CommanderForm({commander, loading, onSubmit, onClose}: CommanderFormProps) {
    const [commanderCopy, setCommanderCopy] = useImmer<Commander>(
        commander ?? {customName: ''} as Commander);

    return (
        <Flex asChild direction='column' gap='1'>
            <form onSubmit={(e) => {
                e.preventDefault();
                onSubmit(commanderCopy);
            }}>
                <CommanderCardSelect
                    card={commanderCopy.card}
                    onCardChange={card => {
                        setCommanderCopy(c => {
                            c.card = card;
                        })
                    }}
                    placeholder={'Find your commander'}
                />
                {
                    (commanderCopy.card || commanderCopy.partner) &&
                    <CommanderCardSelect
                        card={commanderCopy.partner}
                        onCardChange={card => {
                            setCommanderCopy(c => {
                                c.partner = card;
                            })
                        }}
                        placeholder={'Add a partner'}
                    />
                }
                <Flex gap='1'>
                    <Switch checked={commanderCopy.useCustomDisplayName}
                            onClick={() => setCommanderCopy(c => {
                                    c.useCustomDisplayName = !c.useCustomDisplayName;
                                }
                            )}/>
                    <Text>Use custom display name</Text>
                </Flex>
                {commanderCopy.useCustomDisplayName &&
                    <TextField.Root
                        id='name-input'
                        placeholder='Custom name'
                        value={commanderCopy.customName}
                        onChange={e => {
                            const name = e.currentTarget.value;
                            setCommanderCopy(c => {
                                c.customName = name;
                            });
                        }}>
                    </TextField.Root>
                }
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
                    <Button type='submit' loading={loading}>
                        Confirm
                    </Button>
                </Grid>
            </form>
        </Flex>
    );
}
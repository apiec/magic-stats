import {Commander} from "./CommanderApi";
import {useState} from "react";
import {Flex, IconButton, TextField} from "@radix-ui/themes";
import {PlusIcon} from "@radix-ui/react-icons";

type CommanderFormProps = {
    onSubmit: (commander: Commander) => void;
}
export default function CommanderForm({onSubmit}: CommanderFormProps) {
    const [name, setName] = useState<string>('');
    return (
        <Flex asChild direction='row' gap='0'>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    const commander = {name: name} as Commander;
                    onSubmit(commander);
                }}>
                <TextField.Root
                    id='name-input'
                    placeholder='Commander name'
                    value={name}
                    onChange={e => {
                        setName(e.currentTarget.value)
                    }}>
                </TextField.Root>
                <IconButton type='submit' disabled={!name || name.length < 3}>
                    <PlusIcon/>
                </IconButton>
            </form>
        </Flex>
    );
}
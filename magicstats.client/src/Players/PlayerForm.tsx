import {Player} from "./PlayerApi";
import {useState} from "react";
import {Flex, IconButton, TextField} from '@radix-ui/themes';
import {PlusIcon} from '@radix-ui/react-icons';

type PlayerFormProps = {
    onSubmit: (player: Player) => void;
}
export default function PlayerForm({onSubmit}: PlayerFormProps) {
    const [name, setName] = useState<string>('');
    return (
        <Flex asChild direction='row' gap='0'>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    const player = {name: name} as Player;
                    onSubmit(player);
                }}>
                <TextField.Root
                    id='name-input'
                    placeholder='New player name'
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
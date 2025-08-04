import {Player} from "./PlayerApi";
import {Button, Flex, Switch, Text, TextField} from '@radix-ui/themes';
import {useImmer} from "use-immer";

type PlayerFormProps = {
    player?: Player;
    onSubmit: (player: Player) => void;
}
export default function PlayerForm({player, onSubmit}: PlayerFormProps) {
    const [playerCopy, setPlayerCopy] = useImmer<Player>(
        player !== undefined
            ? {...player} as Player
            : {name: '', isGuest: false} as Player
    );
    return (
        <Flex asChild direction='column' gap='2'>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    onSubmit(playerCopy!);
                }}>
                <TextField.Root
                    id='name-input'
                    placeholder='Player name'
                    value={playerCopy?.name}
                    onChange={e => {
                        setPlayerCopy(p => {
                            p.name = e.currentTarget.value;
                        })
                    }}>
                </TextField.Root>
                <Flex direction='row' gap='2' align='center'>
                    <Text size='3'>
                        Is a guest
                    </Text>
                    <Switch checked={playerCopy.isGuest}
                            onClick={() => setPlayerCopy(p => {
                                p.isGuest = !p.isGuest;
                            })}/>
                </Flex>
                <Button type='submit' disabled={playerCopy.name.length < 3}>
                    Confirm
                </Button>
            </form>
        </Flex>
    );
}
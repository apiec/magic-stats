import {Player} from "./PlayerApi.ts";
import {Flex, HoverCard, Link, Text} from '@radix-ui/themes';
import {FaPersonWalkingLuggage} from "react-icons/fa6";
import {Link as RouterLink} from 'react-router-dom';
import {PlayerAvatar} from "./PlayerAvatar.tsx";

type PlayerNameProps = {
    player: Player,
}

export function PlayerName({player}: PlayerNameProps) {
    const name = (
        <Flex direction='row' gap='1' align='center' justify='center'>
            <Link asChild style={{color: 'var(--color)'}}>
                <RouterLink reloadDocument to={'/players/' + player.id}>
                    <Text>{player.name}</Text>
                </RouterLink>
            </Link>
            {player.isGuest && <FaPersonWalkingLuggage/>}
        </Flex>
    );

    return (
        <HoverCard.Root>
            <HoverCard.Trigger>
                {name}
            </HoverCard.Trigger>
            <HoverCard.Content>
                <Flex direction='row' align='center' gap='3'>
                    <PlayerAvatar player={player} size='3'/>
                    <Flex direction='column' align='start'>
                        <Text size='3'>{player.name}</Text>
                        {player.isGuest &&
                            <Flex direction='row' gap='1' align='center'>
                                <Text size='2'>Guest</Text>
                                <Text size='2' asChild><FaPersonWalkingLuggage/></Text>
                            </Flex>
                        }
                    </Flex>
                </Flex>
            </HoverCard.Content>
        </HoverCard.Root>
    );
}
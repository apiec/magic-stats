import {Card, Flex, Spinner, Text} from "@radix-ui/themes";
import {useParams} from "react-router-dom";
import PlayerApi, {Player} from "./PlayerApi.ts";
import {useEffect, useState} from "react";
import {PlayerAvatar} from "./PlayerAvatar.tsx";
import {FaPersonWalkingLuggage} from "react-icons/fa6";

export default function PlayerPage() {
    const {playerId} = useParams<string>();
    const [player, setPlayer] = useState<Player | undefined>();
    useEffect(() => {
        const api = new PlayerApi();
        // todo: add endpoint to get 1 player
        api.getAll().then(ps => setPlayer(ps.find(p => p.id === playerId)));
    }, []);

    if (player === undefined) {
        return <Flex direction='column' align='center' gap='2'>
            <Text>Loading player data</Text>
            <Spinner/>
        </Flex>;
    }

    // todo: add a proper player page
    return (
        <Flex direction='column' align='center' gap='2'>
            <Card>
                <PlayerSummary player={player}/>
            </Card>
        </Flex>
    );
}

type PlayerSummaryCardProps = {
    player: Player
}

function PlayerSummary({player}: PlayerSummaryCardProps) {
    return <Flex direction='row' align='center' gap='3' p='1'>
        <PlayerAvatar player={player} size='6'/>
        <Flex gap='2' direction='column' align='start'>
            <Text size='6'>{player.name}</Text>
            {player.isGuest &&
                <Flex direction='row' gap='1' align='center'>
                    <Text size='3'>Guest</Text>
                    <Text size='3' asChild><FaPersonWalkingLuggage/></Text>
                </Flex>
            }
        </Flex>
    </Flex>
}

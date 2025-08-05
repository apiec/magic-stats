import {Flex, Spinner, Text} from "@radix-ui/themes";
import {useParams} from "react-router-dom";
import PlayerApi, {Player} from "./PlayerApi.ts";
import {useEffect, useState} from "react";
import PlayerForm from "./PlayerForm.tsx";

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
            <PlayerForm player={player} onSubmit={p => {
                const api = new PlayerApi();
                api.update(p).then();
            }}/>
        </Flex>
    );
}
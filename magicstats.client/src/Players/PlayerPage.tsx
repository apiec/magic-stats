import {
    Box,
    Card,
    Dialog,
    Flex,
    Heading,
    IconButton,
    ScrollArea,
    Spinner,
    Text,
} from "@radix-ui/themes";
import {useParams} from "react-router-dom";
import PlayerApi, {CommanderStats, Player, RecentGame, SinglePlayerWithStats} from "./PlayerApi.ts";
import {useEffect, useState} from "react";
import {PlayerAvatar} from "./PlayerAvatar.tsx";
import {FaPersonWalkingLuggage,} from "react-icons/fa6";
import ValueDisplay from "../Shared/ValueDisplay.tsx";
import {CommanderStatsTable} from "./CommanderStatsTable.tsx";
import {Pencil1Icon} from "@radix-ui/react-icons";
import PlayerForm from "./PlayerForm.tsx";
import {PlayerRecentGamesTable} from "./PlayerRecentGamesTable.tsx";

export default function PlayerPage() {
    const {playerId} = useParams<string>();
    const [player, setPlayer] = useState<SinglePlayerWithStats | undefined>();
    const [commanderStats, setCommanderStats] = useState<CommanderStats[]>([]);

    useEffect(() => {
        const api = new PlayerApi();
        api.get(playerId!).then(p => setPlayer(p));
    }, []);
    useEffect(() => {
        const api = new PlayerApi();
        api.getPlayerCommanderStats(playerId!).then(r => setCommanderStats(r.commanders));
    }, [playerId]);

    if (player === undefined) {
        return <Flex direction='column' align='center' gap='2'>
            <Text>Loading player data</Text>
            <Spinner/>
        </Flex>;
    }

    function getMostPlayedCommanderDisplay() {
        if (commanderStats === undefined || commanderStats.length === 0) {
            return ['No games on record'];
        }
        const mostGames = Math.max(...commanderStats.map(x => x.games));
        const mostPlayedCommander = commanderStats.find(x => x.games === mostGames);
        if (mostPlayedCommander === undefined) {
            return ['Not enough games'];
        }
        return [mostPlayedCommander.name, mostGames.toFixed(0)];
    }

    function getBestCommanderDisplay() {
        if (commanderStats === undefined || commanderStats.length === 0) {
            return ['No games on record'];
        }
        const filtered = commanderStats.filter(x => x.games >= 3);
        const bestWinrate = Math.max(...filtered.map(x => x.winrate));
        const bestCommander = filtered.find(x => x.winrate === bestWinrate);
        if (bestCommander === undefined) {
            return ['Not enough games'];
        }
        return [bestCommander.name, toPercentage(bestWinrate)];
    }

    return (
        <Flex direction='column' gap='7' align='center'>
            <Box maxWidth='fit-content' height='fit-content' asChild>
                <Card>
                    <PlayerSummary player={player} onPlayerUpdate={(p) => {
                        const newPlayer = {...player, ...p} as SinglePlayerWithStats;
                        setPlayer(newPlayer);
                    }}/>
                </Card>
            </Box>
            <Flex>
                <Flex gap='2' align='center' wrap='wrap' maxWidth='500px' justify='center'>
                    <ValueDisplay title='Total games' values={[player.stats.games.toFixed(0)]}/>
                    <ValueDisplay title='Winrate' values={[toPercentage(player.stats.winrate)]}/>
                    <ValueDisplay title='WR last 30 games' values={[toPercentage(player.stats.winrateLast30)]}/>
                    {commanderStats
                        ? <ValueDisplay title='Best' values={getBestCommanderDisplay()}
                                        tooltip='Highest winrate commander with 5+ games'/>
                        : <Spinner/>
                    }
                    {commanderStats
                        ? <ValueDisplay title='Most played' values={getMostPlayedCommanderDisplay()}/>
                        : <Spinner/>
                    }
                </Flex>
            </Flex>
            <Flex gap='7' direction='row'>
                <Box maxWidth='600px' maxHeight='300px' minWidth='360px' asChild>
                    <Flex direction='column'>
                        <Heading>Recent games</Heading>
                        <PlayerRecentGames playerId={playerId!} gameCount={30}/>
                    </Flex>
                </Box>
                <Box maxWidth='600px' maxHeight='300px' minWidth='360px' asChild>
                    <Flex direction='column'>
                        <Heading>Played commanders</Heading>
                        {
                            commanderStats
                                ? <ScrollArea>
                                    <CommanderStatsTable stats={commanderStats}/>
                                </ScrollArea>
                                : <Spinner/>
                        }
                    </Flex>
                </Box>
            </Flex>
        </Flex>
    );
}

type PlayerSummaryCardProps = {
    player: Player,
    onPlayerUpdate: (player: Player) => void,
}

function PlayerSummary({player, onPlayerUpdate}: PlayerSummaryCardProps) {
    return (
        <Flex direction='row' align='center' gap='3' p='1'>
            <PlayerAvatar player={player} size='6' radius='full'/>
            <Flex gap='2' direction='column' align='start'>
                <Flex direction='row' align='center' gap='2'>
                    <Text size='6'>{player.name}</Text>
                    <EditPlayerDialog player={player} onUpdate={onPlayerUpdate}/>
                </Flex>
                {player.isGuest &&
                    <Flex direction='row' gap='1' align='center'>
                        <Text size='3'>Guest</Text>
                        <Text size='3' asChild><FaPersonWalkingLuggage/></Text>
                    </Flex>
                }
            </Flex>
        </Flex>
    );
}

type PlayerRecentGamesProps = {
    playerId: string,
    gameCount: number,
}

function PlayerRecentGames({playerId, gameCount}: PlayerRecentGamesProps) {
    const [games, setGames] = useState<RecentGame[] | undefined>();
    useEffect(() => {
        const api = new PlayerApi();
        api.getRecentGames(playerId, gameCount).then((res) => setGames(res.recentGames));
    }, []);
    return games
        ? <ScrollArea>
            <PlayerRecentGamesTable games={games}/>
        </ScrollArea>
        : <Spinner/>;
}

function toPercentage(num: number): string {
    return (100 * num).toFixed(0) + '%'
}

type EditPlayerDialogProps = {
    player: Player,
    onUpdate: (player: Player) => void,
};

function EditPlayerDialog({player, onUpdate}: EditPlayerDialogProps) {
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
                Edit player
            </Dialog.Title>
            <PlayerForm player={player} onSubmit={p => {
                const api = new PlayerApi();
                api.update(p).then((res) => {
                    onUpdate(res);
                    setOpen(false);
                });
            }}/>
        </Dialog.Content>
    </Dialog.Root>;
}
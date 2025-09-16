import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import AddParticipantDialog from "./AddParticipantDialog.tsx";
import {useEffect, useState} from "react";
import StartingOrderList from "./StartingOrderList.tsx";
import {AddParticipantRequest, Game, GamesApi, Participant, Placements} from "../GamesApi.ts";
import {useParams} from "react-router-dom";
import {useImmer} from "use-immer";
import {HostPicker} from "./HostPicker.tsx";
import {Host} from "../../Hosts/HostApi.ts";
import PlacementList from "./PlacementList.tsx";
import {
    Box,
    Button,
    Card,
    Flex,
    Inset,
    Spinner,
    Text,
} from "@radix-ui/themes";
import NumberField from "../../Shared/NumberField.tsx";

export default function GameForm() {
    const [game, setGame] = useImmer<Game | undefined>(undefined);
    const [rerender, setRerender] = useState<number>(0);

    function forceUpdate() {
        setRerender(value => value + 1);
    }

    const {gameId} = useParams<string>();

    useEffect(() => {
        populateGameData();
    }, [rerender]);

    async function populateGameData() {
        const api = new GamesApi();
        const game = await api.get(gameId!);
        setGame(game);
    }

    async function handleDeleteParticipant(playerId: string) {
        const api = new GamesApi();
        await api.deleteParticipant(game!.id, playerId);
        forceUpdate();
    }

    if (game === undefined || game === null) {
        return <Spinner/>;
    }

    return (
        <Flex direction='column' align='center' gap='4'>
            <Flex direction='row' gap='5' align='end'>
                <Box>
                    <Text mb='1' as='div'>Played at:</Text>
                    {/* todo: change the datepicker because this one doesn't act well w/ radix styles*/}
                    <DatePicker
                        id='date-picker-el'
                        name='startedAt'
                        selected={game.playedAt}
                        onChange={async (newDate) => {
                            const api = new GamesApi();
                            await api.updatePlayedAt(game.id, newDate!);
                            setGame((draft) => {
                                if (draft !== undefined) {
                                    draft.playedAt = newDate!;
                                }
                            });
                        }}
                        showTimeSelect
                        className='rt-reset rt-TextFieldInput'
                        wrapperClassName='rt-TextFieldRoot rt-variant-surface'
                        calendarIconClassName='rt-TextFieldSlot'
                        dateFormat='dd-MM-yyyy HH:mm'
                        maxDate={new Date()}
                    />
                </Box>
                <Box>
                    <Text as='div'>Host</Text>
                    <HostPicker
                        currentHost={game.host
                            ? {name: game.host, irl: game.irl} as Host
                            : undefined}
                        onHostChange={host => {
                            handleHostChanged(host).then();
                        }}/>
                </Box>
            </Flex>
            <Flex direction='row' align='end' gap='5'>
                <Box maxWidth='150px'>
                    {
                        game.turns ?
                            <>
                                <Text mb='1' as='div'>Turns</Text>
                                <NumberField value={game.turns} onChange={v => handleTurnsChanged(v).then()}/>
                            </>
                            :
                            <Button size='2' id='add-turns-button' onClick={() => {
                                handleTurnsChanged(1).then();
                            }}>
                                Add turns
                            </Button>
                    }
                </Box>
                <Box>
                    <AddParticipantDialog onAdd={handleAddParticipant}/>
                </Box>
            </Flex>
            <Flex direction={{initial: 'column', md: 'row'}} gap='6'>
                <Card>
                    <Flex direction='column' align='center'>
                        <Text as='span' size='5' mb='3'>Placement</Text>
                        <Inset>
                            <PlacementList
                                participants={game.participants.slice()}
                                onParticipantDeleted={handleDeleteParticipant}
                                onPlacementsChanged={handlePlacementChanged}/>
                        </Inset>
                    </Flex>
                </Card>
                <Card>
                    <Flex direction='column' align='center'>
                        <Text as='span' size='5' mb='3'>Starting order</Text>
                        <Inset>
                            <StartingOrderList
                                participants={game.participants.slice()}
                                onParticipantDeleted={handleDeleteParticipant}
                                onStartingOrdersChanged={handleStartingOrderChanged}/>
                        </Inset>
                    </Flex>
                </Card>
            </Flex>
        </Flex>
    );

    async function handleAddParticipant(newParticipant: Participant) {
        if (game === undefined) {
            return;
        }

        const api = new GamesApi();
        const request = {
            playerId: newParticipant.player.id,
            commanderId: newParticipant.commander.id,
        } as AddParticipantRequest;

        const participantResponse = await api.addParticipant(game.id, request);
        setGame((draft) => {
            if (draft !== undefined) {
                draft.participants.push(participantResponse);
            }
        })
        forceUpdate();
    }

    async function handleStartingOrderChanged(newData: Participant[]) {
        if (game === undefined) {
            return;
        }
        const api = new GamesApi();
        const sorted = newData.sort((a, b) => a.startingOrder - b.startingOrder);
        await api.updateStartingOrder(game.id, sorted.map(p => p.player.id));
        forceUpdate();
    }

    async function handlePlacementChanged(newData: Participant[]) {
        if (game === undefined) {
            return;
        }
        const api = new GamesApi();
        const placements = {} as Placements;
        newData.forEach(p => placements[p.player.id] = p.placement);
        await api.updatePlacement(game.id, placements);
        forceUpdate();
    }

    async function handleHostChanged(host: Host) {
        if (game === undefined) {
            return;
        }
        const api = new GamesApi();
        await api.updateHost(game.id, host.id);
        forceUpdate();
    }

    async function handleTurnsChanged(turns: number) {
        if (game === undefined) {
            return;
        }
        const api = new GamesApi();
        await api.updateTurnCount(game.id, turns);
        forceUpdate();
    }
}
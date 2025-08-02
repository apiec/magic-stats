import CommanderApi, {Commander} from "../../Commanders/CommanderApi.ts";
import PlayerApi, {Player} from "../../Players/PlayerApi.ts";
import {useState} from "react";
import {Participant} from "../GamesApi.ts";
import {Picker, PickerOption} from "../../Shared/Picker.tsx";
import {Button, Dialog, Flex, Text} from "@radix-ui/themes";

type AddParticipantDialogProps = {
    onAdd: (participant: Participant) => void;
}

export default function AddParticipantDialog({onAdd}: AddParticipantDialogProps) {
    const formId = 'add-participant-form'
    const [commander, setCommander] = useState<Commander | undefined>();
    const [player, setPlayer] = useState<Player | undefined>();
    return (
        <Dialog.Root>
            <Dialog.Trigger>
                <Button>Add a participant</Button>
            </Dialog.Trigger>
            <Dialog.Content width='2' maxWidth='300px' >
                <Dialog.Title>
                    Add a game participant
                </Dialog.Title>
                <Flex asChild direction='column' gap='1'>
                    <form
                        className={formId}
                        onSubmit={(e) => {
                            e.preventDefault();
                            const participant = {commander: commander, player: player} as Participant;
                            onAdd(participant);
                        }}>
                        <Text as='label'>Player:</Text>
                        <PlayerPicker onPlayerChange={(p) => setPlayer(p)} value={player}/>
                        <Text as='label'>Commander:</Text>
                        <CommanderPicker onCommanderChange={(c) => setCommander(c)} value={commander}/>
                        <Button mt='3' type='submit'
                                disabled={player === undefined || commander === undefined}>Add</Button>
                    </form>
                </Flex>
            </Dialog.Content>
        </Dialog.Root>
    );
}

type CommanderPickerProps = {
    onCommanderChange: (commander: Commander | undefined) => void;
    value: Commander | undefined;
}

function CommanderPicker({onCommanderChange, value}: CommanderPickerProps) {
    const getCommanders = async () => {
        const commanderApi = new CommanderApi();
        const commanders = await commanderApi.getAll();

        return commanders.map(commanderAsOption);
    };

    return <Picker
        getOptions={getCommanders}
        onValueChange={onCommanderChange}
        value={value !== undefined ? commanderAsOption(value) : undefined}/>
}

function commanderAsOption(commander: Commander): PickerOption<Commander> {
    return {value: commander, label: commander.name} as PickerOption<Commander>;
}

type PlayerPickerProps = {
    onPlayerChange: (player: Player | undefined) => void;
    value: Player | undefined;
}

function PlayerPicker({onPlayerChange, value}: PlayerPickerProps) {
    const getPlayers = async () => {
        const playerApi = new PlayerApi();
        const players = await playerApi.getAll();

        return players.map(playerAsOption);
    };

    return <Picker
        getOptions={getPlayers}
        onValueChange={onPlayerChange}
        value={value !== undefined ? playerAsOption(value) : undefined}/>
}

function playerAsOption(player: Player): PickerOption<Player> {
    return {value: player, label: player.name} as PickerOption<Player>;
}


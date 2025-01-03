﻿// import {Participant} from "../Games";
import CommanderApi, {Commander} from "../../Commanders/CommanderApi.ts";
import PlayerApi, {Player} from "../../Players/PlayerApi.ts";
import Select from "react-select";
import {useEffect, useState} from "react";
import './AddParticipantDialog.css';
import {Participant} from "../GamesApi.ts";

type AddParticipantDialogProps = {
    onAdd: (participant: Participant) => void;
}

export default function AddParticipantDialog({onAdd}: AddParticipantDialogProps) {
    const formId = 'add-participant-form'
    const [commander, setCommander] = useState<Commander | undefined>();
    const [player, setPlayer] = useState<Player | undefined>();
    return (
        <form
            className={formId}
            onSubmit={(e) => {
                e.preventDefault();
                const participant = {commander: commander, player: player} as Participant;
                onAdd(participant);
            }}>
            <label>Player:</label>
            <PlayerPicker onPlayerChange={(p) => setPlayer(p)}/>
            <label>Commander:</label>
            <CommanderPicker onCommanderChange={(c) => setCommander(c)}/>
            <button type='submit' disabled={player === undefined || commander === undefined}>Add</button>
        </form>
    );
}

type CommanderPickerProps = {
    onCommanderChange: (commander: Commander | undefined) => void;
}

function CommanderPicker({onCommanderChange}: CommanderPickerProps) {
    const getCommanders = async () => {
        const commanderApi = new CommanderApi();
        const commanders = await commanderApi.getAll();

        return commanders.map(c => ({value: c, label: c.name,} as PickerOption<Commander>));
    };

    return <Picker className='commander-picker' getOptions={getCommanders} onValueChange={onCommanderChange}/>
}

type PlayerPickerProps = {
    onPlayerChange: (player: Player | undefined) => void;
}

function PlayerPicker({onPlayerChange}: PlayerPickerProps) {
    const getPlayers = async () => {
        const playerApi = new PlayerApi();
        const players = await playerApi.getAll();

        return players.map(p => ({value: p, label: p.name,} as PickerOption<Player>));
    };

    return <Picker className='player-picker' getOptions={getPlayers} onValueChange={onPlayerChange}/>
}

type PickerProps<T> = {
    className: string,
    getOptions: () => Promise<PickerOption<T>[]>,
    onValueChange: (value: T | undefined) => void;
}

type PickerOption<T> = {
    value: T,
    label: string,
}

function Picker<T>({className, getOptions, onValueChange}: PickerProps<T>) {
    const [options, setOptions] = useState<PickerOption<T>[]>();

    const populateOptions = async () => setOptions(await getOptions());
    useEffect(() => {
        populateOptions();
    }, []);

    return <Select
        maxMenuHeight={200}
        className={className}
        options={options}
        onChange={(x) => {
            onValueChange(x?.value);
        }}/>
}

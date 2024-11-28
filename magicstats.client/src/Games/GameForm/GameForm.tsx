import {useEffect, useState} from "react";
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css'
import Select from 'react-select';
import CommanderApi from "../../Commanders/CommanderApi.ts";
import PlayerApi from "../../Players/PlayerApi.ts";

export default function GameForm() {

    const [date, setDate] = useState<Date | null>(new Date());

    return (
        <div>
            <DatePicker
                showIcon
                selected={date}
                onChange={(d) => setDate(d)}
                showTimeSelect
                dateFormat='dd-MM-yyyy HH:mm'
                maxDate={new Date()}/>
            <CommanderPicker/>
            <PlayerPicker/>
        </div>
    );
}

function Participants() {
    return (
        <>
            <Select>

            </Select>
        </>
    );
}

function CommanderPicker() {
    const getCommanders = async () => {
        const commanderApi = new CommanderApi();
        const commanders = await commanderApi.getAll();

        return commanders.map(c => ({
            value: c.id,
            label: c.contents,
        } as PickerOption));
    };

    return <Picker getOptions={getCommanders}/>
}

function PlayerPicker() {
    const getPlayers = async () => {
        const playerApi = new PlayerApi();
        const players = await playerApi.getAll();

        return players.map(p => ({
            value: p.id,
            label: p.contents,
        } as PickerOption));
    };

    return <Picker getOptions={getPlayers}/>
}

type PickerProps<T extends PickerOption> = {
    getOptions: () => Promise<T[]>,
}

type PickerOption = {
    value: string,
    label: string,
}

function Picker<TOption extends PickerOption>({getOptions}: PickerProps<TOption>) {
    const [options, setOptions] = useState<TOption[]>();

    const populateOptions = async () => setOptions(await getOptions());
    useEffect(() => {
        populateOptions();
    }, []);

    return <Select options={options}/>
}
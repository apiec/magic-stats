import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import './GameForm.css';
import AddParticipantDialog from "./AddParticipantDialog.tsx";
import {useRef, useState} from "react";
import {Participant} from "../Games.tsx";

export default function GameForm() {
    const [date, setDate] = useState<Date | null>(new Date());
    const [participants, setParticipants] = useState<Participant[]>([]);

    const dialogRef = useRef<HTMLDialogElement>(null);

    function toggleDialog() {
        if (!dialogRef.current) {
            return;
        }
        dialogRef.current.hasAttribute("open")
            ? dialogRef.current.close()
            : dialogRef.current.showModal();
    }

    return (
        <div id='game-form-component'>

            <form id='game-form' onSubmit={(e) => {
                e.preventDefault();
            }}>
                <label htmlFor='date-picker'>Played at:</label>
                <DatePicker
                    id='date-picker'
                    name='startedAt'
                    selected={date}
                    onChange={(d) => setDate(d)}
                    showIcon
                    showTimeSelect
                    dateFormat='dd-MM-yyyy HH:mm'
                    maxDate={new Date()}/>
            </form>

            <button onClick={toggleDialog}>+1 byczq</button>
            <dialog id='participant-dialog' ref={dialogRef} onClick={(e) => {
                if (e.currentTarget === e.target) {
                    toggleDialog();
                }
            }}>
                <AddParticipantDialog onAdd={(p) => {
                    const newParticipants = participants.slice();
                    newParticipants.push(p);
                    setParticipants(newParticipants);
                    toggleDialog();
                }}/>
            </dialog>

            {participants.map(p => <p id={p.player.id}>{p.player.name + ' ' + p.commander.name}</p>)}
        </div>
    );
}
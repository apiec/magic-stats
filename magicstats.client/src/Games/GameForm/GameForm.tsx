import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import './GameForm.css';
import AddParticipantDialog from "./AddParticipantDialog.tsx";
import {useRef, useState} from "react";
import {Participant} from "../Games.tsx";
import DragAndDropParticipantsList from "./DragAndDropParticipantsList.tsx";

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
            <dialog id='participant-dialog' ref={dialogRef} onClick={(e) => {
                if (e.currentTarget === e.target) {
                    toggleDialog();
                }
            }}>
                <AddParticipantDialog onAdd={(participant) => {
                    const newParticipants = participants.slice();
                    participant.startingOrder = participants.length;
                    participant.placement = participants.length;
                    newParticipants.push(participant);
                    setParticipants(newParticipants);
                    toggleDialog();
                }}/>
            </dialog>
            <div id='date-picker'>
                <label htmlFor='date-picker'>Played at:</label>
                <DatePicker
                    name='startedAt'
                    selected={date}
                    onChange={(d) => setDate(d)}
                    showIcon
                    showTimeSelect
                    dateFormat='dd-MM-yyyy HH:mm'
                    maxDate={new Date()}/>
            </div>

            <button id='add-participant-button' onClick={toggleDialog}>+1 byczq</button>

            <div id='starting-order-section'>
                <h3>Starting order</h3>
                <DragAndDropParticipantsList
                    orderedColumnName='#'
                    orderedData={participants.slice().sort(((a, b) => a.startingOrder - b.startingOrder))}
                    onDataReordered={(newData) => {
                        newData.forEach((p, i) => p.startingOrder = i);
                        setParticipants(newData)
                    }}/>
            </div>
            <div id='placement-section'>
                <h3>Placement</h3>
                <DragAndDropParticipantsList
                    orderedColumnName='#'
                    orderedData={participants.slice().sort(((a, b) => a.placement - b.placement))}
                    onDataReordered={(newData) => {
                        newData.forEach((p, i) => p.placement = i);
                        setParticipants(newData)
                    }}/>
            </div>
        </div>
    );
}


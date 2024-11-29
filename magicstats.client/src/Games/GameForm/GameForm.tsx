import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import './GameForm.css';
import AddParticipantPopup from "./AddParticipantPopup.tsx";
import {useState} from "react";

export default function GameForm() {
    const [date, setDate] = useState<Date | null>(new Date());
    const formId = 'game-form'

    return (
        <div className='game-form-component'>
            <form id={formId} name={formId} onSubmit={(e) => {
                e.preventDefault();
                console.log(e);
            }}>
                <label form={formId} htmlFor='date-picker'>Played at:</label>
                <DatePicker
                    id='date-picker'
                    name='startedAt'
                    form={formId}
                    selected={date}
                    onChange={(d) => setDate(d)}
                    showIcon
                    showTimeSelect
                    dateFormat='dd-MM-yyyy HH:mm'
                    maxDate={new Date()}/>
                <button type='submit'>
                    GUWNO
                </button>
            </form>
            <AddParticipantPopup onAdd={(p) => console.log(p)}/>
        </div>
    );
}
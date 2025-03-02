import {Commander} from "./CommanderApi";
import {useState} from "react";

type CommanderFormProps = {
    onSubmit: (commander: Commander) => void;
}
export default function CommanderForm({onSubmit}: CommanderFormProps) {
    const [name, setName] = useState<string>('');
    return (
        <form
            className='commander-form'
            onSubmit={(e) => {
                e.preventDefault();
                const commander = {name: name} as Commander;
                onSubmit(commander);
            }}>
            <input id="name-input" placeholder='Name' value={name}
                   onChange={e => {
                       setName(e.currentTarget.value);
                   }}/>
            <button type='submit' disabled={!name || name.length < 3}>+</button>
        </form>
    );
}
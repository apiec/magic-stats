import {Player} from "./PlayerApi";
import {useState} from "react";

type PlayerFormProps = {
    onSubmit: (player: Player) => void;
}
export default function PlayerForm({onSubmit}: PlayerFormProps) {
    const [name, setName] = useState<string>('');
    return (
        <form
            className='player-form'
            onSubmit={(e) => {
                e.preventDefault();
                const player = {name: name} as Player;
                onSubmit(player);
            }}>
            <input id="name-input" placeholder='Name' autoFocus={true} value={name} onChange={e => {
                setName(e.currentTarget.value);
            }}/>
            <button type='submit' disabled={!name || name.length < 3}>+</button>
        </form>
    );
}
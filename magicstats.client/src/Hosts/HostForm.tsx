import {Host} from "./HostApi.ts";
import {useState} from "react";

type HostFormProps = {
    onSubmit: (host: Host) => void;
}
export default function HostForm({onSubmit}: HostFormProps) {
    const [name, setName] = useState<string>('');
    const [irl, setIrl] = useState<boolean>(true);
    return (
        <form
            className='host-form'
            onSubmit={(e) => {
                e.preventDefault();
                const host = {name: name, irl: irl} as Host;
                onSubmit(host);
            }}>
            <div className='host-form-inputs'>
                <input id="host-name-input" placeholder='Name' value={name}
                       onChange={e => {
                           setName(e.currentTarget.value);
                       }}/>
                <div className="irl-input-div">
                    <label htmlFor="irl-input">Is IRL</label>
                    <input className="irl-input" id="irl-input" type='checkbox' placeholder='IRL'
                           checked={irl}
                           onClick={(e) => {
                               setIrl(e.currentTarget.checked);
                           }}/>
                </div>
            </div>
            <button type='submit' disabled={!name || name.length < 3}>+</button>
        </form>
    );
}
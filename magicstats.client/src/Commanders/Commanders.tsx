import './Commanders.css'
import {useEffect, useState} from "react";
import "./CommanderApi.ts";
import CommanderData, {
    CreateCommander,
    CreateCommanderRequest,
    DeleteCommander, DeleteCommanderRequest,
    GetCommanders
} from "./CommanderApi.ts";

export default function Commanders() {
    const [commanderData, setCommanderData] = useState<CommanderData>();

    useEffect(() => {
        populateCommanderData();
    }, []);

    if (commanderData === undefined) {
        return <><p>Loading data...</p></>;
    }

    return (
        <div className="commanders">
            <div className="table">
                {commanderData.commanders.map(commander =>
                    <Row key={commander.id} name={commander.name} onDelete={() => handleDelete(commander.id)}/>
                )}
                <AddRowButton placeholder="Commander's name" onSubmitInput={handleSubmitInput}/>
            </div>
        </div>
    );

    async function handleSubmitInput(input: string) {
        const request = {name: input} as CreateCommanderRequest;
        const commander = await CreateCommander(request);
        const newCommanders = [...commanderData!.commanders, commander];
        setCommanderData({commanders: newCommanders} as CommanderData);
    }

    async function populateCommanderData() {
        const data = await GetCommanders();
        setCommanderData(data);
    }

    async function handleDelete(id: string) {
        const request = {id: id} as DeleteCommanderRequest;
        await DeleteCommander(request);
        const newCommanders = commanderData!.commanders.filter(c => c.id !== id);
        setCommanderData({commanders: newCommanders} as CommanderData);
    }
}

interface RowProps {
    name: string;
    onDelete: () => void;
}

function Row({name, onDelete}: RowProps) {
    const [showDeleteButton, setShowDeleteButton] = useState(false);
    return (
        <div className="row"
             onMouseEnter={() => setShowDeleteButton(true)}
             onMouseLeave={() => setShowDeleteButton(false)}>

            <div className="text">
                {name}
            </div>
            {
                showDeleteButton &&
                <button className="delete-button" onClick={handleDelete}>
                    X
                </button>
            }
        </div>
    );

    function handleDelete(e: React.MouseEvent<HTMLButtonElement>) {
        e.stopPropagation();
        onDelete();
    }
}

interface FormElements extends HTMLFormControlsCollection {
    input: HTMLInputElement;
}

interface InputFormElement extends HTMLFormElement {
    readonly elements: FormElements;
}

interface AddRowButtonProps {
    placeholder: string;
    onSubmitInput: (input: string) => Promise<any>
}

function AddRowButton({placeholder, onSubmitInput}: AddRowButtonProps) {

    const [isAdding, setIsAdding] = useState(false);

    async function handleSubmit(event: React.FormEvent<InputFormElement>) {
        event.preventDefault();
        await onSubmitInput(event.currentTarget.elements.input.value);
        setIsAdding(false);
    }

    const contents = isAdding ? (
            <div className="row">
                <form method="post" onSubmit={handleSubmit}>
                    <input autoFocus id="input" placeholder={placeholder}/>
                    <button type="submit" className="submit-button">
                        +
                    </button>
                </form>
            </div>)
        : (
            <button onClick={() => setIsAdding(true)}>
                +
            </button>);

    return (
        <div>
            {contents}
        </div>
    );
}
import './SimpleTable.css'
import {useEffect, useState} from "react";
import {TableEntry, TableApi} from "./TableApi.ts";

export interface SimpleTableProps<TEntry extends TableEntry> {
    tableApi: TableApi<TEntry>;
}

export default function SimpleTable<TEntry extends TableEntry>({tableApi}: SimpleTableProps<TEntry>) {
    const [entries, setEntries] = useState<TEntry[]>();

    useEffect(() => {
        populateTableData();
    }, []);

    if (entries === undefined) {
        return <><p>Loading data...</p></>;
    }

    return (
        <div className="simple-table">
            <div className="table">
                {entries.map(entry =>
                    <Row key={entry.id} name={entry.contents} onDelete={() => handleDelete(entry.id)}/>
                )}
                <AddRowButton placeholder="Commander's name" onSubmitInput={handleSubmitInput}/>
            </div>
        </div>
    );

    async function handleSubmitInput(input: string) {
        if (input.length === 0) {
            return;
        }
        const entry = {contents: input} as TEntry;
        const response = await tableApi.create(entry);
        const newEntries = [...entries ?? [], response];
        setEntries(newEntries);
    }

    async function populateTableData() {
        const data = await tableApi.getAll();
        setEntries(data);
    }

    async function handleDelete(id: string) {
        await tableApi.delete(id);
        const newEntries = entries?.filter(e => e.id !== id);
        setEntries(newEntries);
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

    const [isActive, setIsActive] = useState(false);

    async function handleSubmit(event: React.FormEvent<InputFormElement>) {
        event.preventDefault();
        await onSubmitInput(event.currentTarget.elements.input.value);
        setIsActive(false);
    }

    const contents = isActive ? (
            <div className="row">
                <form method="post" onSubmit={handleSubmit}>
                    <input id="input" placeholder={placeholder} autoFocus={true}/>
                    <button type="submit" className="submit-button">
                        +
                    </button>
                </form>
            </div>)
        : (
            <button onClick={() => setIsActive(true)}>
                +
            </button>);

    return (
        <div>
            {contents}
        </div>
    );
}
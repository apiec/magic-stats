import {useEffect, useState} from "react";

interface CommanderData {
    commanders: Commander[];
}

interface Commander {
    name: string,
    id: string,
}

export function Commanders() {
    const [commanderData, setCommanderData] = useState<CommanderData>();

    useEffect(() => {
        populateCommanderData()
    }, []);

    if (commanderData === undefined) {
        return <><p>Loading data...</p></>;
    }

    return (
        <div className="commanders">
            <h1 id="tabelLabel">Commanders!</h1>
            <table className="table table-striped" aria-labelledby="tabelLable">
                <thead>
                <tr>
                    <th>id</th>
                    <th>name</th>
                </tr>
                </thead>
                <tbody>
                {commanderData.commanders.map(commander =>
                    <tr key={commander.id}>
                        <td>{commander.id}</td>
                        <td>{commander.name}</td>
                    </tr>
                )}
                </tbody>

            </table>
        </div>
    );

    async function populateCommanderData() {
        const response = await fetch('api/commanders');
        const data = await response.json();
        console.log(data);
        setCommanderData(data);
    }
}
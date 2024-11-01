import './Commanders.css'
import SimpleTable from "../Shared/SimpleTable/SimpleTable.tsx";
import CommanderApi from "./CommanderApi.ts";

export default function Commanders() {
    return (
        <div className={"commanders"}>
            <h3>Commanders</h3>
            <SimpleTable tableApi={new CommanderApi()}/>
        </div>
    );
}
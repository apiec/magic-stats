import './Players.css'
import SimpleTable from "../Shared/SimpleTable/SimpleTable.tsx";
import PlayerApi from "./PlayerApi.ts";

export default function Players() {
    return (
        <div className={"players"}>
            <h3>Commanders</h3>
            <SimpleTable tableApi={new PlayerApi()}/>
        </div>
    );
}
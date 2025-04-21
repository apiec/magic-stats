import {Outlet} from "react-router-dom";

export default function Games() {
    return (
        <div className='games-component'>
            <Outlet/>
        </div>
    );
}
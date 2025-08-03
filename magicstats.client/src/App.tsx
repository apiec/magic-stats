import Navbar from "./Navbar/Navbar.tsx";
import {Outlet} from "react-router-dom";
import './App.css'

function App() {
    return (
        <div className='base-grid'>
            <Navbar/>
            <div className='content'>
                <Outlet/>
            </div>
        </div>);
}

export default App;
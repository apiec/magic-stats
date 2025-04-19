import './App.css';
import Navbar from "./Navbar/Navbar.tsx";
import {Outlet} from "react-router-dom";

function App() {
    return (
        <>
            <Navbar/>
            <div className='content'>
                <Outlet/>
            </div>
        </>);
}

export default App;
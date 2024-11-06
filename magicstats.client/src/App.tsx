import './App.css';
import Navbar from "./Navbar/Navbar.tsx";
import Commanders from "./Commanders/Commanders.tsx";
import Players from "./Players/Players.tsx";
import Games from "./Games/Games.tsx";

function App() {
    return (
        <>
            <Navbar/>
            <Commanders/>
            <Players/>
            <Games/>
        </>);
}

export default App;


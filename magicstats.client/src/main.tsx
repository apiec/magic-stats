import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import Commanders from "./Commanders/Commanders.tsx";
import Players from "./Players/Players.tsx";
import GamesTable from "./Games/GamesTable.tsx";
import GameForm from "./Games/GameForm/GameForm.tsx";
import Games from "./Games/Games.tsx";
import HomePage from "./Home/HomePage.tsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App/>,
        children: [
            {
                index: true,
                element: <HomePage/>,
            },
            {
                path: "commanders",
                element: <Commanders/>,
            },
            {
                path: "players",
                element: <Players/>,
            },
            {
                path: "games",
                element: <Games/>,
                children: [
                    {
                        index: true,
                        element: <GamesTable/>,
                    },
                    {
                        path: ":gameId",
                        element: <GameForm/>,
                    }
                ],
            },
        ]
    },
]);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <RouterProvider router={router}/>
    </StrictMode>,
)

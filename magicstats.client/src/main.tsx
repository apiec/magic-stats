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
import Pods from "./Pods/Pods.tsx";
import Hosts from "./Hosts/Hosts.tsx";
import PlayerPage from "./Players/PlayerDetails.tsx";
import PlayersOutlet from "./Players/PlayersOutlet.tsx";

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
                element: <PlayersOutlet/>,
                children: [
                    {
                        index: true,
                        element: <Players/>
                    },
                    {
                        path: ":playerId",
                        element: <PlayerPage/>
                    }
                ],
            },
            {
                path: "pods",
                element: <Pods/>,
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
            {
                path: "hosts",
                element: <Hosts/>,
            }
        ]
    },
]);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <RouterProvider router={router}/>
    </StrictMode>,
)

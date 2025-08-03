import './index.css';
import "@radix-ui/themes/styles.css";
import {Theme} from "@radix-ui/themes";
import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import App from './App.tsx'
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import Commanders from "./Commanders/Commanders.tsx";
import Players from "./Players/Players.tsx";
import GamesTableComponent from "./Games/GamesTable.tsx";
import GameForm from "./Games/GameForm/GameForm.tsx";
import Games from "./Games/Games.tsx";
import HomePage from "./Home/HomePage.tsx";
import Pods from "./Pods/Pods.tsx";
import Hosts from "./Hosts/Hosts.tsx";
import {ThemeProvider} from 'next-themes';

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
                path: "pods",
                element: <Pods/>,
            },
            {
                path: "games",
                element: <Games/>,
                children: [
                    {
                        index: true,
                        element: <GamesTableComponent/>,
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
        <ThemeProvider attribute='class'>
            <Theme
                accentColor='indigo'
                grayColor='slate'
                panelBackground='solid'
                scaling='100%'
                radius='medium'
                style={{height: '100%'}}
            >
                <RouterProvider router={router}/>
            </Theme>
        </ThemeProvider>
    </StrictMode>,
)

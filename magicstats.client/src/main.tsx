import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import Commanders from "./Commanders/Commanders.tsx";
import Players from "./Players/Players.tsx";
import Games from "./Games/Games.tsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App/>,
        children: [
            {
                path: "commanders",
                element: <Commanders/>
            },
            {
                path: "players",
                element: <Players/>
            },
            {
                path: "games",
                element: <Games/>
            },
        ]
    },
]);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <RouterProvider router={router}/>
    </StrictMode>,
)

import {Container, Grid} from "@radix-ui/themes";
import Navbar from "./Navbar/Navbar.tsx";
import {Outlet} from "react-router-dom";

function App() {
    return (
        <>
            <Grid areas={'"top-bar top-bar" "nav content"'} columns='200px 1fr' rows='fit-content(80px) 1fr'>
                <Navbar/>
                <Container style={{gridArea: 'content'}}>
                    <Outlet/>
                </Container>
            </Grid>
        </>);
}

export default App;
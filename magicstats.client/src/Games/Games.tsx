import {Container} from "@radix-ui/themes";
import {Outlet} from "react-router-dom";

export default function Games() {
    return (
        <Container width='100%'>
            <Outlet/>
        </Container>
    );
}
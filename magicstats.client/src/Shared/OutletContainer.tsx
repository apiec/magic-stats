import {Flex} from "@radix-ui/themes";
import {Outlet} from "react-router-dom";

export default function OutletContainer() {
    return (
        <Flex width='100%' direction='column' align='center'>
            <Outlet/>
        </Flex>
    );
}
import {Card, Flex, Spinner, Text} from '@radix-ui/themes';
import {useEffect, useState} from 'react';
import {useImmer} from 'use-immer';
import HostApi, {HostWithStats} from "./HostApi.ts";
import HostsTable from "./HostsTable.tsx";
import HostForm from "./HostForm.tsx";

export default function Hosts() {
    const [hosts, setHosts] = useImmer<HostWithStats[] | undefined>(undefined);
    const [rerender, setRerender] = useState<number>(0);

    useEffect(() => {
        populateHostData().then();
    }, [rerender]);

    async function populateHostData() {
        const api = new HostApi();
        const hosts = await api.getAllWithStats();
        setHosts(() => hosts);
    }

    if (hosts === undefined) {
        return <Spinner/>;
    }

    return (
        <Flex direction='column' gap='4'>
            <Card>
                <Flex direction='column'>
                    <Text>Add a new host:</Text>
                    <HostForm onSubmit={h => {
                        const api = new HostApi();
                        api.create(h.name, h.irl).then(_ => {
                            setRerender(rerender + 1);
                        });
                    }}/>
                </Flex>
            </Card>
            <HostsTable hosts={hosts}/>
        </Flex>
    );
}
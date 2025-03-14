import './Hosts.css'
import HostApi, {HostWithStats} from "./HostApi.ts";
import {useEffect, useState} from 'react';
import {useImmer} from 'use-immer';
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
        return <p>Loading...</p>;
    }

    return (
        <section className='hosts-section'>
            <section className='hosts-controls'>
                <div>
                    <p className='add-host-label'>Add a new host:</p>
                    <HostForm onSubmit={h => {
                        const api = new HostApi();
                        api.create(h.name, h.irl).then(_ => {
                            setRerender(rerender + 1);
                        });
                    }}/>
                </div>
            </section>
            <HostsTable hosts={hosts}/>
        </section>
    );
}
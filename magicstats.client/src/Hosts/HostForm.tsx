import {Button, Checkbox, Flex, Text, TextField} from "@radix-ui/themes";
import {Host} from "./HostApi.ts";
import {useState} from "react";

type HostFormProps = {
    onSubmit: (host: Host) => void;
}
export default function HostForm({onSubmit}: HostFormProps) {
    const [name, setName] = useState<string>('');
    const [online, setOnline] = useState<boolean>(false);
    return (
        <form onSubmit={(e) => {
            e.preventDefault();
            const host = {name: name, irl: !online} as Host;
            onSubmit(host);
        }}>
            <Flex direction='column' gap='2'>
                <TextField.Root placeholder='Name' value={name}
                                onChange={e => {
                                    setName(e.currentTarget.value);
                                }}/>
                <Flex align='center' gap='2'>
                    <Text as='label'>Is online</Text>
                    <Checkbox checked={online} onClick={(e) => {
                        e.preventDefault();
                        setOnline(!online);
                    }}/>
                </Flex>
                <Button type='submit' disabled={!name || name.length < 3}>Add</Button>
            </Flex>
        </form>
    );
}
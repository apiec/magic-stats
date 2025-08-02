import HostApi, {Host} from "../../Hosts/HostApi";
import {Picker} from "../../Shared/Picker";
import {PickerOption} from "../../Shared/Picker.tsx";

type HostPickerProps = {
    currentHost: Host | undefined;
    onHostChange: (host: Host) => void;
}

export function HostPicker({currentHost, onHostChange}: HostPickerProps) {
    const getHosts = async () => {
        const hostApi = new HostApi();
        const hosts = await hostApi.getAll();

        return hosts.map(c => ({value: c, label: c.name,} as PickerOption<Host>));
    };

    return (
        <Picker
            getOptions={getHosts}
            value={currentHost ? {value: currentHost, label: currentHost.name} : undefined}
            onValueChange={(host) => {
                if (host) {
                    onHostChange(host);
                }
            }}
        />);
}

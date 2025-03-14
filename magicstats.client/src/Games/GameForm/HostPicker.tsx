import HostApi, {Host} from "../../Hosts/HostApi";
import {Picker} from "../../Shared/Picker";
import {PickerOption} from "../../Shared/Picker.tsx";

type HostPickerProps = {
    currentHost: Host;
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
            className='host-picker'
            getOptions={getHosts}
            value={{value: currentHost, label: currentHost.name}}
            onValueChange={(host) => {
                if (host) {
                    onHostChange(host);
                }
            }}
        />);
}

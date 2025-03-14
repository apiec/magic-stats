import {useEffect, useState} from "react";
import Select from "react-select";

type PickerProps<T> = {
    className: string,
    getOptions: () => Promise<PickerOption<T>[]>,
    onValueChange: (value: T | undefined) => void,
    value?: PickerOption<T>,
}

export type PickerOption<T> = {
    value: T,
    label: string,
}

export function Picker<T>({className, getOptions, onValueChange, value}: PickerProps<T>) {
    const [options, setOptions] = useState<PickerOption<T>[]>();

    const populateOptions = async () => setOptions(await getOptions());
    useEffect(() => {
        populateOptions();
    }, []);

    return <Select
        value={value}
        maxMenuHeight={200}
        className={className}
        options={options}
        onChange={(x) => {
            onValueChange(x?.value);
        }}/>
}

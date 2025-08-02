import {useEffect, useState} from "react";
import {Select, Skeleton} from "@radix-ui/themes";

type PickerProps<T> = {
    getOptions: () => Promise<PickerOption<T>[]>,
    onValueChange: (value: T | undefined) => void,
    value?: PickerOption<T>,
}

export type PickerOption<T> = {
    value: T,
    label: string,
}

export function Picker<T>({getOptions, onValueChange, value}: PickerProps<T>) {
    const [options, setOptions] = useState<PickerOption<T>[] | undefined>(undefined);

    const populateOptions = async () => setOptions(await getOptions());
    useEffect(() => {
        populateOptions();
    }, []);

    return <Skeleton loading={options === undefined}>
        <Select.Root value={value?.label} onValueChange={(v) => {
            const result = options?.find(o => o.label === v)
            if (result !== undefined) {
                onValueChange(result.value);
            }
        }}>
            <Select.Trigger/>
            <Select.Content>
                {options?.map(o =>
                    <Select.Item key={o.label} value={o.label}>{o.label}</Select.Item>)}
            </Select.Content>
        </Select.Root>
    </Skeleton>
}

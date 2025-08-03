import {MinusIcon, PlusIcon} from "@radix-ui/react-icons";
import {IconButton, TextField} from "@radix-ui/themes"

type NumberFieldProps = {
    value: number,
    id?: string,
    min?: number,
    max?: number,
    onChange: (value: number) => void;
}
export default function NumberField({value, id, min, max, onChange}: NumberFieldProps) {
    return (
        <TextField.Root
            id={id}
            type='number'
            value={value} min={min} max={max}
            defaultValue={0}
            onChange={(e) => onChange(e.currentTarget.valueAsNumber)}
        >
            <TextField.Slot>
                <IconButton variant='ghost' onClick={() => onChange(value - 1)}>
                    <MinusIcon/>
                </IconButton>
            </TextField.Slot>
            <TextField.Slot>
                <IconButton variant='ghost' onClick={() => onChange(value + 1)}>
                    <PlusIcon/>
                </IconButton>
            </TextField.Slot>
        </TextField.Root>);
}
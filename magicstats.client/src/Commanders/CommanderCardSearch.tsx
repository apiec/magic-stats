import Api from "../api/Api.ts";
import {Box, Button, Flex, Inset, Popover, Text} from "@radix-ui/themes";
import {MagnifyingGlassIcon, ChevronDownIcon} from "@radix-ui/react-icons";
import Select from 'react-select';
import {DropdownIndicatorProps, MultiValue, SingleValue, components,} from "react-select";
import {useEffect, useState} from "react";
import {useDebounce} from "../Shared/useDebounce.ts";

type CommanderCardSearchProps = {}

export function CommanderCardSearch({}: CommanderCardSearchProps) {
    const [commander, setCommander] = useState<CommanderOption | null>();
    const [open, setOpen] = useState<boolean>(false);
    const [input, setInput] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [options, setOptions] = useState<CommanderOption[]>();
    const debouncedInput = useDebounce<string>(input, 500);

    function onChange(value: SingleValue<CommanderOption> | MultiValue<CommanderOption>) {
        setCommander(value as SingleValue<CommanderOption>);
        setOpen(false);
    }

    useEffect(() => {
        setOptions([]);
        if (input.length >= 2) {
            setLoading(true);
        }
    }, [input]);

    useEffect(() => {
        if (debouncedInput.length < 2) {
            return;
        }
        loadOptions(debouncedInput)
            .then((res) => {
                setOptions(res);
                setLoading(false);
            })
    }, [debouncedInput]);

    return (
        <Popover.Root open={open} onOpenChange={(o) => setOpen(o)}>
            <Popover.Trigger>
                <Button color='gray' variant='surface'>
                    <Flex align='center' gap='2'>
                        <Box asChild maxWidth='200px'>
                            <Text truncate wrap='nowrap'>{commander ? commander.label : 'Find your commander'}</Text>
                        </Box>
                        <ChevronDownIcon/>
                    </Flex>
                </Button>
            </Popover.Trigger>
            <Popover.Content height='300px' minWidth='120px' >
                <Inset>
                    <Box height='300px' p='1'>
                        <Select
                            autoFocus
                            menuPlacement='bottom'
                            minMenuHeight={300}
                            maxMenuHeight={300}
                            controlShouldRenderValue={false}
                            menuIsOpen={open}
                            tabSelectsValue={false}
                            components={{DropdownIndicator, IndicatorSeparator: null}}
                            placeholder={<Text>Search for a commander</Text>}
                            noOptionsMessage={(v) => {
                                return v.inputValue && v.inputValue.length >= 2
                                    ? 'No results found'
                                    : 'Input at least 2 letters to start searching'
                            }}
                            value={commander}
                            onChange={onChange}
                            options={options}
                            inputValue={input}
                            onInputChange={(v) => setInput(v)}
                            isLoading={loading}
                            styles={{
                                option: (baseStyles, state) => ({
                                    ...baseStyles,
                                    color: state.isSelected ? state.theme.colors.neutral0 : baseStyles.color,
                                }),
                                menu: (baseStyles, _) => ({
                                    ...baseStyles,
                                    boxShadow: 'none',
                                }),
                            }} theme={(theme) => ({
                            ...theme,
                            colors: {
                                ...theme.colors,
                                primary: 'var(--gray-12)',
                                primary75: 'var(--accent-indicator)',
                                primary50: 'var(--accent-indicator)',
                                primary25: 'var(--accent-indicator)',
                                // danger: '',
                                // dangerLight: '',
                                neutral0: 'var(--gray-2)',
                                neutral5: 'var(--gray-9)',
                                neutral10: 'var(--gray-9)',
                                neutral20: 'var(--gray-7)',
                                neutral30: 'var(--gray-9)',
                                neutral40: 'var(--gray-9)',
                                neutral50: 'var(--gray-9)',
                                neutral60: 'var(--gray-9)',
                                neutral70: 'var(--gray-9)',
                                neutral80: 'var(--gray-11)',
                                neutral90: 'var(--gray-12)',
                            }
                        })}/>
                    </Box>
                </Inset>
            </Popover.Content>
        </Popover.Root>
    );
}

async function loadOptions(inputValue: string): Promise<CommanderOption[]> {
    const api = new CommanderCardsApi();
    const response = await api.search(inputValue);
    return response.map(c => {
        return {value: c.id, label: c.name, card: c}
    })
}

type CommanderOption = {
    card: SimpleCard,
    value: string,
    label: string,
}


function DropdownIndicator(props: DropdownIndicatorProps<CommanderOption>) {
    return (
        <components.DropdownIndicator {...props}>
            <MagnifyingGlassIcon/>
        </components.DropdownIndicator>
    );
}

type SimpleCard = {
    id: string,
    name: string,
}

type GetCardsResponse = {
    cards: SimpleCard[],
}

class CommanderCardsApi {
    private path: string = 'commanders/cards';
    private api = new Api();

    public async search(name?: string, skip?: number, take?: number): Promise<SimpleCard[]> {
        const queryParams = new URLSearchParams()
        if (name) {
            queryParams.append('name', name);
        }
        if (skip || skip === 0) {
            queryParams.append('skip', skip.toFixed(0));
        }
        if (take) {
            queryParams.append('take', take.toFixed(0));
        }
        const queryString = queryParams.size > 0
            ? '?' + queryParams.toString()
            : '';

        const response = await this.api.get<GetCardsResponse>(this.path + queryString);
        return response.cards;
    }
}
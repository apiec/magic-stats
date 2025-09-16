import Api from "../api/Api.ts";
import {Box, Button, Flex, HoverCard, Inset, Popover, Text} from "@radix-ui/themes";
import {MagnifyingGlassIcon, ChevronDownIcon} from "@radix-ui/react-icons";
import Select from 'react-select';
import {DropdownIndicatorProps, MultiValue, SingleValue, components,} from "react-select";
import {useEffect, useState} from "react";
import {useDebounce} from "../Shared/useDebounce.ts";
import {useTheme} from "next-themes";
import {Card} from "./CommanderApi.ts";

type CommanderCardSelectProps = {
    card: Card | undefined,
    onCardChange: (card: Card | undefined) => void,
    placeholder?: string,
}

export function CommanderCardSelect({card, onCardChange, placeholder}: CommanderCardSelectProps) {
    const cardOption = card ? toOption(card) : undefined;
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [input, setInput] = useState<string>('');
    const debouncedInput = useDebounce<string>(input, 500);
    const [options, setOptions] = useState<CardOption[]>();
    const {resolvedTheme} = useTheme();

    function onChange(value: SingleValue<CardOption> | MultiValue<CardOption>) {
        const opt = value as SingleValue<CardOption>;
        onCardChange(opt?.card);
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
                            <Text truncate wrap='nowrap'>{cardOption ? cardOption.label : placeholder}</Text>
                        </Box>
                        <ChevronDownIcon/>
                    </Flex>
                </Button>
            </Popover.Trigger>
            <Popover.Content minWidth='120px' maxWidth='240px'>
                <Inset>
                    <Box height='340px' p='1'>
                        <Select
                            autoFocus
                            menuPlacement='bottom'
                            minMenuHeight={290}
                            maxMenuHeight={290}
                            controlShouldRenderValue={false}
                            menuIsOpen={open}
                            tabSelectsValue={false}
                            components={{DropdownIndicator, IndicatorSeparator: null}}
                            placeholder={'Search for a commander'}
                            noOptionsMessage={(v) => {
                                return v.inputValue && v.inputValue.length >= 2
                                    ? 'No results found'
                                    : 'Input at least 2 letters to start searching'
                            }}
                            value={cardOption}
                            onChange={onChange}
                            options={options}
                            inputValue={input}
                            onInputChange={(v) => setInput(v)}
                            isLoading={loading}
                            isClearable
                            formatOptionLabel={(option) => <CardOptionLabel card={option.card}/>}
                            styles={{
                                input: (baseStyles, _) => ({
                                    ...baseStyles,
                                    minWidth: 180,
                                }),
                                option: (baseStyles, state) => ({
                                    ...baseStyles,
                                    color: state.isSelected
                                        ? state.theme.colors.neutral0
                                        : state.isFocused
                                            ? (resolvedTheme === 'light' ? state.theme.colors.neutral0 : state.theme.colors.neutral90)
                                            : baseStyles.color,
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

function toOption(card: Card): CardOption {
    return {
        value: card.id,
        label: card.name,
        card: card
    } as CardOption;
}

async function loadOptions(inputValue: string): Promise<CardOption[]> {
    const api = new CommanderCardsApi();
    const response = await api.search(inputValue);
    return response.map(toOption);
}

type CardOption = {
    card: Card,
    value: string,
    label: string,
}

function DropdownIndicator(props: DropdownIndicatorProps<CardOption>) {
    return (
        <components.DropdownIndicator {...props}>
            <MagnifyingGlassIcon/>
        </components.DropdownIndicator>
    );
}

type CardOptionProps = {
    card: Card,
}

export function CardOptionLabel({card}: CardOptionProps) {
    return (
        <HoverCard.Root openDelay={700}>
            <HoverCard.Trigger>
                <Box width='100%' height='100%' asChild>
                    <Text as='div' align='left'>
                        {card.name}
                    </Text>
                </Box>
            </HoverCard.Trigger>
            <HoverCard.Content maxWidth='300px' side='right'>
                <Inset>
                    <Box width='100%' asChild>
                        <img src={card.images.borderCrop} alt={card.name}/>
                    </Box>
                </Inset>
            </HoverCard.Content>
        </HoverCard.Root>
    );
}

type GetCardsResponse = {
    cards: Card[],
}

class CommanderCardsApi {
    private path: string = 'commanders/cards';
    private api = new Api();

    public async search(name?: string, skip?: number, take?: number): Promise<Card[]> {
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
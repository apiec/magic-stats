import {Box, Flex, ScrollArea, SegmentedControl, Switch, Table, Text} from "@radix-ui/themes";
import SortableHeader from "../Shared/SortableHeader.tsx";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    TableState,
    useReactTable,
} from "@tanstack/react-table";
import {useImmer} from "use-immer";
import {RecordAgainstPlayer} from "./PlayerApi";
import {PlayerName} from "./PlayerName.tsx";
import {useState} from "react";

type RecordAgainstPlayerTableProps = {
    records: RecordAgainstPlayer[],
};

type StatsType = 'absolute' | 'relative';

export function RecordAgainstPlayerTable({records}: RecordAgainstPlayerTableProps) {
    const [statsType, setStatsType] = useState<StatsType>('relative');
    const [showGuests, setShowGuests] = useState<boolean>(false);
    const filtered = records.filter(r => showGuests || !r.isGuest);
    return (
        <>
            <Box my='2' asChild>
                <Flex direction='row' gap='2' align='center'>
                    <Box width='fit-content'>
                        <SegmentedControl.Root size='1' defaultValue='absolute' onValueChange={(value) => {
                            setStatsType(value as StatsType);
                        }}>
                            <SegmentedControl.Item value='absolute'>Absolute</SegmentedControl.Item>
                            <SegmentedControl.Item value='relative'>Relative</SegmentedControl.Item>
                        </SegmentedControl.Root>
                    </Box>
                    <Box>
                        <Flex gap='1' align='center'>
                            <Text size='2'>Show guests</Text>
                            <Switch size='2' checked={showGuests} onClick={() => setShowGuests(!showGuests)}/>
                        </Flex>
                    </Box>
                </Flex>
            </Box>
            <ScrollArea>
                <RecordTable records={filtered} statsType={statsType}/>
            </ScrollArea>
        </>);
}

type RecordTableProps = {
    records: RecordAgainstPlayer[],
    statsType: StatsType,
};

function RecordTable({records, statsType}: RecordTableProps) {
    const absoluteTable = useReactTable({
        data: records,
        columns: absoluteTableColumns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        initialState: {
            sorting: [
                {
                    id: 'absoluteDifference',
                    desc: true,
                }
            ],
        },
    })
    const [absoluteTableState, setAbsoluteTableState] = useImmer<TableState>({
        ...absoluteTable.initialState,
    });

    absoluteTable.setOptions((prev) => {
        return {
            ...prev,
            state: absoluteTableState,
            onStateChange: setAbsoluteTableState,
        };
    });
    const relativeTable = useReactTable({
        data: records,
        columns: relativeTableColumns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        initialState: {
            sorting: [
                {
                    id: 'relativeDifference',
                    desc: true,
                }
            ],
        },
    })
    const [relativeTableState, setRelativeTableState] = useImmer<TableState>({
        ...relativeTable.initialState,
    });

    relativeTable.setOptions((prev) => {
        return {
            ...prev,
            state: relativeTableState,
            onStateChange: setRelativeTableState,
        };
    });

    const displayTable = statsType === 'absolute' ? absoluteTable : relativeTable;
    return <Table.Root variant='ghost'>
        <Table.Header>
            {displayTable.getHeaderGroups().map(headerGroup => (
                <Table.Row key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                        <Table.RowHeaderCell key={header.id}>
                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        </Table.RowHeaderCell>
                    ))}
                </Table.Row>))}
        </Table.Header>
        <Table.Body>
            {displayTable.getRowModel().rows.map(row => (
                <Table.Row key={row.id}>
                    {row.getVisibleCells().map(cell => (
                        <Table.Cell key={cell.id} align='center'>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </Table.Cell>))}
                </Table.Row>
            ))}
        </Table.Body>
    </Table.Root>
}

const columnHelper = createColumnHelper<RecordAgainstPlayer>();

const relativeTableColumns = [
    columnHelper.accessor('name', {
        id: 'name',
        header: ctx => <SortableHeader text='Name' context={ctx}/>,
        cell: props => <PlayerName player={props.row.original}/>
    }),
    columnHelper.accessor('gamesAgainst', {
        id: 'gamesAgainst',
        header: ctx => <SortableHeader text='Games' context={ctx}/>,
    }),
    columnHelper.accessor('relativeDifference', {
        id: 'relativeDifference',
        header: ctx => <SortableHeader text={'Diff'} context={ctx}/>,
        cell: props => (props.getValue() > 0 ? '+' : '') + toPercentage(props.getValue()),
    }),
    columnHelper.accessor('winrateAgainst', {
        id: 'winrateAgainst',
        header: ctx => <SortableHeader text={'Wins'} context={ctx}/>,
        cell: props => toPercentage(props.getValue()),
    }),
    columnHelper.accessor('lossrateAgainst', {
        id: 'lossrateAgainst',
        header: ctx => <SortableHeader text={'Losses'} context={ctx}/>,
        cell: props => toPercentage(props.getValue()),
    }),
];

const absoluteTableColumns = [
    columnHelper.accessor('name', {
        id: 'name',
        header: ctx => <SortableHeader text='Name' context={ctx}/>,
        cell: props => <PlayerName player={props.row.original}/>
    }),
    columnHelper.accessor('gamesAgainst', {
        id: 'gamesAgainst',
        header: ctx => <SortableHeader text='Games' context={ctx}/>,
    }),
    columnHelper.accessor('absoluteDifference', {
        id: 'absoluteDifference',
        header: ctx => <SortableHeader text={'Diff'} context={ctx}/>,
        cell: props => (props.getValue() > 0 ? '+' : '') + props.getValue(),
    }),
    columnHelper.accessor('winsAgainst', {
        id: 'winsAgainst',
        header: ctx => <SortableHeader text={'Wins'} context={ctx}/>,
    }),
    columnHelper.accessor('lossesAgainst', {
        id: 'lossesAgainst',
        header: ctx => <SortableHeader text={'Losses'} context={ctx}/>,
    }),
];

function toPercentage(num: number): string {
    return (100 * num).toFixed(0) + '%'
}

import './Players.css'
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    HeaderContext,
    TableState,
    useReactTable
} from '@tanstack/react-table';
import {useEffect} from 'react';
import PlayerApi, {PlayerWithStats} from './PlayerApi';
import {FaSort, FaSortDown, FaSortUp} from 'react-icons/fa';
import {useImmer} from 'use-immer';

export default function Players() {
    const [players, setPlayers] = useImmer<PlayerWithStats[]>([]);
    const table = useReactTable({
        data: players,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        initialState: {
            sorting: [
                {
                    id: 'name',
                    desc: false,
                }
            ],
        },
    })
    const [tableState, setTableState] = useImmer<TableState>({
        ...table.initialState,
    });

    table.setOptions((prev) => {
        return {
            ...prev,
            state: tableState,
            onStateChange: setTableState,
        };
    });

    useEffect(() => {
        populatePlayerData().then();
    }, []);

    async function populatePlayerData() {
        const api = new PlayerApi();
        const players = await api.getAllWithStats();
        setPlayers(() => players);
    }

    return (
        <section className='players-section'>
            <table className='players-table'>
                <thead>
                {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                            <th key={header.id}>
                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                            </th>
                        ))}
                    </tr>
                ))
                }
                </thead>
                <tbody>
                {table.getRowModel().rows.map(row => (
                    <tr key={row.id}>
                        {row.getVisibleCells().map(cell => (
                            <td key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>))}
                    </tr>
                ))}
                </tbody>
            </table>
        </section>
    );
}

const columnHelper = createColumnHelper<PlayerWithStats>();

const columns = [
    columnHelper.accessor('name', {
        id: 'name',
        header: ctx => <SortableHeader text='Name' context={ctx}/>,
    }),
    columnHelper.accessor('stats.games', {
        id: 'games',
        header: ctx => <SortableHeader text='Games' context={ctx}/>,
    }),
    columnHelper.accessor('stats.wins', {
        id: 'wins',
        header: ctx => <SortableHeader text='Wins' context={ctx}/>,
    }),
    columnHelper.accessor('stats.winrate', {
        id: 'winrate',
        header: ctx => <SortableHeader text='WR%' context={ctx}/>,
        cell: props => toPercentage(props.row.original.stats.winrate)
    }),
    columnHelper.accessor('stats.winrateLast10', {
        id: 'winrateLast10',
        header: ctx => <SortableHeader text='WRL10' context={ctx}/>,
        cell: props => toPercentage(props.row.original.stats.winrateLast10)
    }),
];

function toPercentage(num: number): string {
    return (100 * num).toFixed(0);
}

type SortableHeaderProps = {
    text: string,
    context: HeaderContext<PlayerWithStats, any>,
}

function SortableHeader({text, context}: SortableHeaderProps) {
    function handleSort() {
        context.table.setState(state => {
            if (state.sorting[0].id === context.column.id) {
                state.sorting[0].desc = !state.sorting[0].desc;
            } else {
                state.sorting[0] = {id: context.column.id, desc: context.column.id !== 'name'};
            }

            return state;
        });
    }

    function sortingIcon() {
        const ownId = context.column.id;
        const sort = context.table.getState().sorting[0];
        if (ownId !== sort.id) {
            return <FaSort className='sort-icon inactive-sort'/>
        }
        return sort.desc ? <FaSortDown className='sort-icon'/> : <FaSortUp className='sort-icon'/>
    }

    return (
        <div className='sortable-header' onClick={e => {
            e.stopPropagation();
            handleSort();
        }}>
            <p>{text}</p>
            {sortingIcon()}
        </div>
    );

}
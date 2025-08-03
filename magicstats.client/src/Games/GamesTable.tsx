import {
    ColumnDef,
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
    VisibilityState
} from "@tanstack/react-table";
import {useEffect, useState} from "react";
import {GameDetails} from "./GameDetails/GameDetails.tsx";
import {format} from "date-fns";
import {Game, GamesApi} from './GamesApi.ts';
import {Link as RouterLink, useNavigate} from 'react-router-dom';
import {Button, Flex, IconButton, Table,} from '@radix-ui/themes';
import {Pencil1Icon} from '@radix-ui/react-icons';
import DeleteButton from "../Shared/DeleteButton.tsx";

export default function GamesTable() {
    const [games, setGames] = useState<Game[]>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
        'playedAt': true,
        'winning_commander': true,
        'winning_player': true,
        'pod_size': true,
        'turns': true,
        'host': true,
        'irl': true,
        'edit': true,
        'delete': true,
    });

    useEffect(() => {
        const handleResize = () => {
            const isMobile = window.innerWidth < 768;
            setColumnVisibility({
                'playedAt': true,
                'winning_commander': true,
                'winning_player': true,
                'pod_size': true,
                'turns': !isMobile,
                'host': !isMobile,
                'irl': !isMobile,
                'edit': true,
                'delete': true,
            });
        }
        window.addEventListener('resize', handleResize);
        handleResize();
    }, []);

    const table = useReactTable({
        data: games,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        initialState: {
            sorting: [
                {
                    id: 'playedAt',
                    desc: true,
                }
            ]
        },
        state: {
            columnVisibility,
        },
    });

    async function populateGameData() {
        const api = new GamesApi();
        const games = await api.getAll();
        setGames(games);
    }

    useEffect(() => {
        populateGameData();
    }, []);

    const navigate = useNavigate();

    async function handleNewGame() {
        const api = new GamesApi();
        const game = await api.createNewGame();
        await navigate(game.id);
    }

    return (
        <Flex align='center' direction='column' gap='3'>
            <Button size='4' onClick={handleNewGame}>
                New game
            </Button>
            <Table.Root variant='surface'>
                <Table.Header>
                    {table.getHeaderGroups().map(headerGroup => (
                        <Table.Row key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <Table.Cell key={header.id} colSpan={header.colSpan} align='center'>
                                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                </Table.Cell>
                            ))}
                        </Table.Row>
                    ))}
                </Table.Header>
                <Table.Body>
                    {table.getRowModel().rows.map(row => (
                        <GameDetails key={row.id} game={games.find(g => g.id === row.original.id)!} trigger={
                            <Table.Row key={row.id}>
                                {row.getVisibleCells().map(cell => (
                                    <Table.Cell key={cell.id} align='center'>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </Table.Cell>))}
                            </Table.Row>
                        }/>
                    ))}
                </Table.Body>
            </Table.Root>
        </Flex>
    );
}

const columnHelper = createColumnHelper<Game>();

const columns: ColumnDef<Game, any>[] = [
    columnHelper.accessor('playedAt', {
        id: 'playedAt',
        header: 'Played at',
        cell: props => format(props.row.original.playedAt, "dd/MM/yyyy HH:mm"),
    }),
    columnHelper.accessor(game => game.participants.length, {
        id: 'pod_size',
        header: 'Pod size',
    }),
    columnHelper.accessor((g) => g.winner?.commander.name ?? 'no data', {
        id: 'winning_commander',
        header: 'Commander'
    }),
    columnHelper.accessor((g) => g.winner?.player.name ?? 'no data', {
        id: 'winning_player',
        header: 'Player'
    }),
    columnHelper.accessor('host', {
        id: 'host',
        header: 'Host',
        cell: props => props.row.original.host ?? '-',
    }),
    columnHelper.display({
        id: 'edit',
        header: 'Edit',
        cell: props => <EditGameButton gameId={props.row.original.id}/>,
    }),
    columnHelper.display({
        id: 'delete',
        header: 'Delete',
        cell: props => <DeleteButton onClick={() => {
            const api = new GamesApi();
            api.delete(props.row.original.id)
                .then(() => window.location.reload());
        }}/>,
    })
];

type EditGameButtonProps = {
    gameId: string,
}

function EditGameButton({gameId}: EditGameButtonProps) {
    return (
        <IconButton size='1' variant='ghost' asChild>
            <RouterLink to={gameId} onClick={(e) => e.stopPropagation()}>
                <Pencil1Icon/>
            </RouterLink>
        </IconButton>
    );
}
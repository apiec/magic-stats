import {
    ColumnDef,
    createColumnHelper,
    getCoreRowModel,
    RowSelectionState,
    useReactTable,
    VisibilityState
} from "@tanstack/react-table";
import {useMemo, useState} from "react";
import {arrayMove} from "@dnd-kit/sortable";
import {Participant} from "../GamesApi.ts";
import DndTable from "../../Shared/DndTable.tsx";
import DeleteButton from "../../Shared/DeleteButton.tsx";
import {FaTrophy} from "react-icons/fa";
import {Button, Flex} from "@radix-ui/themes";

type PlacementListProps = {
    participants: Participant[],
    onPlacementsChanged: (values: Participant[]) => void,
    onParticipantDeleted: (playerId: string) => void,
}

export default function PlacementList(
    {
        participants,
        onPlacementsChanged,
        onParticipantDeleted,
    }: PlacementListProps) {

    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
        'select': false,
        'placement': true,
        'playerName': true,
        'commanderName': true,
        'delete': true,
    });

    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const columns = useMemo<ColumnDef<Participant, any>[]>(() => getColumnDefinition(onParticipantDeleted), []);
    const sortedData = participants.sort((a, b) => a.placement - b.placement);

    const table = useReactTable({
        columns: columns,
        data: sortedData,
        state: {
            rowSelection,
            columnVisibility,
        },
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getRowId: row => row.player.id.toString(),
    });

    function handleDraw() {
        const rows = table.getRowModel().rows;
        const selectedParticipants = rows.filter(r => r.getIsSelected()).map(r => r.original);
        const maxPlacement = Math.max(...selectedParticipants.map(p => p.placement));
        for (const p of selectedParticipants) {
            p.placement = maxPlacement;
        }
        const sortedParticipants = rows.map(r => r.original).sort((a, b) => a.placement - b.placement);

        let lastPlacement = sortedParticipants.length - 1;
        let drawCount = 1;
        for (let i = sortedParticipants.length - 1; i >= 0; i--) {
            if (sortedParticipants[i].placement === lastPlacement) {
                drawCount += 1;
            } else {
                sortedParticipants[i].placement = i;
                lastPlacement = i;
                drawCount = 1;
            }
        }

        onPlacementsChanged(sortedParticipants);
    }

    function toggleDrawsView(draws: boolean) {
        table.getColumn('select')!.toggleVisibility(draws);
        table.getColumn('placement')!.toggleVisibility(!draws);
    }

    return (
        <Flex direction='column'>
            <Flex direction='row' gap='2'>
                {
                    table.getColumn('select')!.getIsVisible() ?
                        <>
                            <Button size='1' disabled={Object.keys(rowSelection).length <= 1} onClick={(e) => {
                                e.stopPropagation();
                                handleDraw();
                                table.resetRowSelection();
                                toggleDrawsView(false);
                            }}>
                                Confirm
                            </Button>
                            <Button size='1' onClick={(e) => {
                                e.stopPropagation();
                                table.resetRowSelection();
                                toggleDrawsView(false);
                            }}>
                                Close
                            </Button>
                        </>
                        :
                        <Button size='2' onClick={(e) => {
                            e.stopPropagation();
                            toggleDrawsView(true);
                        }}>
                            Add a draw
                        </Button>
                }
            </Flex>
            <DndTable table={table} onItemsSwap={(rowAId, rowBId) => {
                const oldIndex = sortedData.findIndex(p => p.player.id === rowAId);
                const newIndex = sortedData.findIndex(p => p.player.id === rowBId);
                const newData = arrayMove(sortedData, oldIndex, newIndex);
                newData.forEach((p, i) => p.placement = i);
                onPlacementsChanged(newData);
            }}/>
        </Flex>
    );
}

function getColumnDefinition(onParticipantDeleted: (playerId: string) => void): ColumnDef<Participant, any>[] {
    const columnHelper = createColumnHelper<Participant>();
    return [
        columnHelper.display({
            id: 'select',
            header: 'Select',
            cell: ({row}) => <input type='checkbox' checked={row.getIsSelected()}
                                    onChange={row.getToggleSelectedHandler()}></input>,
            size: 60,
        }),
        columnHelper.display({
            id: 'placement',
            header: '#',
            cell: ({row}) => row.original.placement + 1,
            size: 60,
        }),
        columnHelper.accessor('player.name', {
            id: 'playerName',
            header: 'Player',
            cell: ({row}) => row.original.placement === 0 ?
                (<Flex direction='row' gap='3' align='center'>
                    {row.original.player.name} <FaTrophy/>
                </Flex>) :
                row.original.player.name
        }),
        columnHelper.accessor('commander.name', {
            id: 'commanderName',
            header: 'Commander',
        }),
        columnHelper.display({
            id: 'delete',
            header: 'Delete',
            cell: ({row}) => <DeleteButton onClick={() => onParticipantDeleted(row.original.player.id)}/>,
            size: 60,
        }),
    ];
}
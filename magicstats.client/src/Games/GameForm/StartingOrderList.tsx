import {ColumnDef, createColumnHelper, getCoreRowModel, useReactTable,} from "@tanstack/react-table";
import {useMemo} from "react";
import {arrayMove} from "@dnd-kit/sortable";
import {Participant} from "../GamesApi.ts";
import DeleteButton from "../../Shared/DeleteButton.tsx";
import DndTable from "../../Shared/DndTable.tsx";
import {Flex} from "@radix-ui/themes";
import {FaTrophy} from "react-icons/fa";

type StartingOrderList = {
    participants: Participant[],
    onStartingOrdersChanged: (values: Participant[]) => void,
    onParticipantDeleted: (playerId: string) => void,
}

export default function StartingOrderList(
    {
        participants,
        onStartingOrdersChanged,
        onParticipantDeleted,
    }: StartingOrderList) {

    const columns = useMemo<ColumnDef<Participant, any>[]>(() => getColumnDefinition(onParticipantDeleted), []);
    const sorted = participants.sort((a, b) => a.startingOrder - b.startingOrder);
    const table = useReactTable({
        columns: columns,
        data: sorted,
        getCoreRowModel: getCoreRowModel(),
        getRowId: row => row.player.id,
    });

    return (
        <DndTable table={table} onItemsSwap={(rowAId, rowBId) => {
            const oldIndex = sorted.findIndex(p => p.player.id === rowAId);
            const newIndex = sorted.findIndex(p => p.player.id === rowBId);
            const newData = arrayMove(sorted, oldIndex, newIndex);
            newData.forEach((p, i) => p.startingOrder = i);
            onStartingOrdersChanged(newData);
        }}/>
    );
}

function getColumnDefinition(onParticipantDeleted: (playerId: string) => void): ColumnDef<Participant, any>[] {
    const columnHelper = createColumnHelper<Participant>();
    return [
        columnHelper.display({
            id: 'startingOrder',
            header: '#',
            cell: ({row}) => row.original.startingOrder + 1,
            size: 60,
        }),
        columnHelper.accessor('player.name', {
            id: 'playerName',
            header: 'Player',
            cell: ({row}) => row.original.placement === 0 ?
                (<Flex direction='row' gap='3' align='center'>
                    {row.original.player.name} <FaTrophy color='gold'/>
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
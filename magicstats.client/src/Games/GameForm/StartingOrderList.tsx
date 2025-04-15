import {ColumnDef, createColumnHelper, flexRender, getCoreRowModel, Row, useReactTable} from "@tanstack/react-table";
import {CSSProperties, useMemo} from "react";
import {
    closestCenter,
    DndContext,
    type DragEndEvent,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {arrayMove, SortableContext, useSortable, verticalListSortingStrategy} from "@dnd-kit/sortable";
import {CSS} from '@dnd-kit/utilities';
import {restrictToVerticalAxis} from "@dnd-kit/modifiers";
import {Participant} from "../GamesApi.ts";
import {FaGripLines, FaTrash} from "react-icons/fa";
import "./DragAndDropParticipantsList.css";

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

    function handleDragEnd(event: DragEndEvent) {
        const {active, over} = event;
        if (active && over && active.id !== over.id) {
            const oldIndex = sorted.findIndex(p => p.player.id === active.id);
            const newIndex = sorted.findIndex(p => p.player.id === over.id);
            const newData = arrayMove(sorted, oldIndex, newIndex);
            newData.forEach((p, i) => p.startingOrder = i);
            onStartingOrdersChanged(newData);
        }
    }

    const sensors = useSensors(
        useSensor(MouseSensor, {}),
        useSensor(TouchSensor, {}),
        useSensor(KeyboardSensor, {}),
    )

    return (
        <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}>
            <table className='dnd-participant-list'>
                <thead>
                {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                            <th key={header.id} colSpan={header.colSpan}>
                                {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                    )}
                            </th>
                        ))}
                    </tr>
                ))}
                </thead>
                <tbody>
                <SortableContext
                    items={participants.map(p => p.player.id)}
                    strategy={verticalListSortingStrategy}>
                    {table.getRowModel().rows.map(row => (
                        <DraggableRow key={row.id} row={row} />
                    ))}
                </SortableContext>
                </tbody>
            </table>
        </DndContext>
    );
}

function getColumnDefinition(onParticipantDeleted: (playerId: string) => void): ColumnDef<Participant, any>[] {
    const columnHelper = createColumnHelper<Participant>();
    return [
        columnHelper.display({
            id: 'dragHandle',
            header: 'Move',
            cell: ({row}) => <RowDragHandleCell rowId={row.id}/>,
            size: 60,
        }),
        columnHelper.display({
            id: 'startingOrder',
            header: '#',
            cell: ({row}) => row.original.startingOrder + 1,
            size: 60,
        }),
        columnHelper.accessor('player.name', {
            id: 'playerName',
            header: 'Player',
        }),
        columnHelper.accessor('commander.name', {
            id: 'commanderName',
            header: 'Commander',
        }),
        columnHelper.display({
            id: 'delete',
            header: 'Delete',
            cell: ({row}) =>
                <FaTrash
                    className='dnd-delete-button'
                    onClick={(e) => {
                        e.stopPropagation();
                        onParticipantDeleted(row.original.player.id);
                    }}/>,
            size: 60,
        }),
    ];
}

type RowDragHandleCellProps = {
    rowId: string,
}

function RowDragHandleCell({rowId}: RowDragHandleCellProps) {
    const {attributes, listeners} = useSortable({
        id: rowId,
    });

    return (
        <FaGripLines {...attributes} {...listeners} className='move-row-icon'/>
    )
}

type DraggableRowProps = {
    row: Row<Participant>,
}

function DraggableRow({row}: DraggableRowProps) {
    const {transform, transition, setNodeRef, isDragging} = useSortable({
        id: row.original.player.id,
    });

    const style: CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition: transition,
        opacity: isDragging ? 0.8 : 1,
        zIndex: isDragging ? 1 : 0,
        position: 'relative',
    }

    return (
        <tr ref={setNodeRef} style={style}>
            {row.getAllCells().map(cell => (
                <td key={cell.id} style={{width: cell.column.getSize()}}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
            ))}
        </tr>
    );
}
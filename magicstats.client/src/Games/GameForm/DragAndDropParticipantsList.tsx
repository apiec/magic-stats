import {ColumnDef, createColumnHelper, flexRender, getCoreRowModel, Row, useReactTable} from "@tanstack/react-table";
import {Participant} from "../Games";
import {CSSProperties} from "react";
import {
    DndContext,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    closestCenter,
    type DragEndEvent,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {arrayMove, SortableContext, useSortable, verticalListSortingStrategy} from "@dnd-kit/sortable";
import {CSS} from '@dnd-kit/utilities';
import {restrictToVerticalAxis} from "@dnd-kit/modifiers";

type DragAndDropListProps = {
    data: Participant[],
    onDataChanged: (values: Participant[]) => void,
}

export default function DragAndDropParticipantsList({data, onDataChanged}: DragAndDropListProps) {
    const table = useReactTable({
        columns: columns,
        data: data, 
        getCoreRowModel: getCoreRowModel(),
        getRowId: row => row.player.id,
    });

    function handleDragEnd(event: DragEndEvent) {
        const {active, over} = event;
        if (active && over && active.id !== over.id) {
            const oldIndex = data.findIndex(p => p.player.id === active.id);
            const newIndex = data.findIndex(p => p.player.id === over.id);
            const newData = arrayMove(data, oldIndex, newIndex);
            onDataChanged(newData);
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
            <table>
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
                    items={data.map(p => p.player.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {table.getRowModel().rows.map(row => (
                        <DraggableRow key={row.id} row={row}/>
                    ))}
                </SortableContext>
                </tbody>
            </table>
        </DndContext>
    );
}

const columnHelper = createColumnHelper<Participant>();
const columns: ColumnDef<Participant, any>[] = [
    columnHelper.display({
        id: 'drag-handle',
        header: 'Move',
        cell: ({row}) => <RowDragHandleCell rowId={row.id}/>,
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
];

type RowDragHandleCellProps = {
    rowId: string,
}

function RowDragHandleCell({rowId}: RowDragHandleCellProps) {
    const {attributes, listeners} = useSortable({
        id: rowId,
    });

    return (
        <button {...attributes} {...listeners}>
            🟰
        </button>
    )
}

type DraggableRowProps = {
    row: Row<Participant>
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
            {row.getVisibleCells().map(cell => (
                <td key={cell.id} style={{width: cell.column.getSize()}}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
            ))}
        </tr>
    );
}
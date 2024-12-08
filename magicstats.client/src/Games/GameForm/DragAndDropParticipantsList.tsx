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
import {Participant} from "../GamesTable.tsx";

type DragAndDropListProps = {
    orderedData: Participant[],
    onDataReordered: (values: Participant[]) => void,
    orderedColumnName: string,
}

export default function DragAndDropParticipantsList({orderedData, onDataReordered, orderedColumnName}: DragAndDropListProps) {
    const columns = useMemo<ColumnDef<Participant, any>[]>(() => getColumnDefinition(orderedColumnName), []);
    const table = useReactTable({
        columns: columns,
        data: orderedData,
        getCoreRowModel: getCoreRowModel(),
        getRowId: row => row.player.id,
    });

    function handleDragEnd(event: DragEndEvent) {
        const {active, over} = event;
        if (active && over && active.id !== over.id) {
            const oldIndex = orderedData.findIndex(p => p.player.id === active.id);
            const newIndex = orderedData.findIndex(p => p.player.id === over.id);
            const newData = arrayMove(orderedData, oldIndex, newIndex);
            onDataReordered(newData);
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
                    items={orderedData.map(p => p.player.id)}
                    strategy={verticalListSortingStrategy}>
                    {table.getRowModel().rows.map(row => (
                        <DraggableRow key={row.id} row={row}/>
                    ))}
                </SortableContext>
                </tbody>
            </table>
        </DndContext>
    );
}

function getColumnDefinition(orderedColumnName: string): ColumnDef<Participant, any>[] {
    const columnHelper = createColumnHelper<Participant>();
    return [
        columnHelper.display({
            id: 'drag-handle',
            cell: ({row}) => <RowDragHandleCell rowId={row.id}/>,
            size: 60,
        }),
        columnHelper.display({
            id: 'ordering',
            header: orderedColumnName,
            cell: ({row}) => row.index + 1,
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
}

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
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

type DragAndDropListProps = {
    stylePlacement?: boolean,
    participants: Participant[],
    onDataReordered: (values: Participant[]) => void,
    onParticipantDeleted: (playerId: string) => void,
    orderedColumnName: string,
    orderedValueGetter: (p: Participant) => number,
}

type ParticipantRow = Participant & {
    onRowDeleted: () => void,
    orderedValue: () => number,
}

export default function DragAndDropParticipantsList(
    {
        stylePlacement,
        participants,
        onDataReordered,
        onParticipantDeleted,
        orderedColumnName,
        orderedValueGetter,
    }: DragAndDropListProps) {

    const columns = useMemo<ColumnDef<ParticipantRow, any>[]>(() => getColumnDefinition(orderedColumnName), []);
    const sortedData = participants
        .sort((a, b) => orderedValueGetter(a) - orderedValueGetter(b))
        .map(p => {
            return {
                ...p,
                onRowDeleted: () => onParticipantDeleted(p.player.id),
                orderedValue: () => orderedValueGetter(p)
            } as ParticipantRow
        });
    const table = useReactTable({
        columns: columns,
        data: sortedData,
        getCoreRowModel: getCoreRowModel(),
        getRowId: row => row.player.id,
    });

    function handleDragEnd(event: DragEndEvent) {
        const {active, over} = event;
        if (active && over && active.id !== over.id) {
            const oldIndex = sortedData.findIndex(p => p.player.id === active.id);
            const newIndex = sortedData.findIndex(p => p.player.id === over.id);
            const newData = arrayMove(sortedData, oldIndex, newIndex);
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
                    items={sortedData.map(p => p.player.id)}
                    strategy={verticalListSortingStrategy}>
                    {table.getRowModel().rows.map(row => (
                        <DraggableRow key={row.id} row={row} stylePlacement={stylePlacement}/>
                    ))}
                </SortableContext>
                </tbody>
            </table>
        </DndContext>
    );
}

function getColumnDefinition(orderedColumnName: string): ColumnDef<ParticipantRow, any>[] {
    const columnHelper = createColumnHelper<ParticipantRow>();
    return [
        columnHelper.display({
            id: 'drag-handle',
            header: 'Move',
            cell: ({row}) => <RowDragHandleCell rowId={row.id}/>,
            size: 60,
        }),
        columnHelper.display({
            id: 'ordering',
            header: orderedColumnName,
            cell: ({row}) => row.original.orderedValue(),
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
                        row.original.onRowDeleted();
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
    stylePlacement?: boolean,
}

function DraggableRow({row, stylePlacement}: DraggableRowProps) {
    const {transform, transition, setNodeRef, isDragging} = useSortable({
        id: row.original.player.id,
    });

    const style: CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition: transition,
        opacity: isDragging ? 0.8 : 1,
        zIndex: isDragging ? 1 : 0,
        position: 'relative',
        background: stylePlacement && row.index === 0 ? 'yellow' : undefined,
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
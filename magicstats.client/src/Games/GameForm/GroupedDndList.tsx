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

type ParticipantRowGroup = {
    participants: ParticipantRow[],
    orderedValue: number,
}

type ParticipantRow = Participant & {
    onRowDeleted: () => void,
    orderedValue: () => number,
}

type GroupedDndListProps = {
    participants: Participant[],
    onDataReordered: (values: Participant[]) => void,
    onParticipantDeleted: (playerId: string) => void,
    orderedValueGetter: (p: Participant) => number,
}

export default function GroupedDndList(
    {
        participants,
        onDataReordered,
        onParticipantDeleted,
        orderedValueGetter,
    }: GroupedDndListProps) {

    const columns = useMemo<ColumnDef<ParticipantRowGroup, any>[]>(() => getColumnDefinition(), []);
    const mappedRows = participants
        .map(p => {
            return {
                ...p,
                onRowDeleted: () => onParticipantDeleted(p.player.id),
                orderedValue: () => orderedValueGetter(p)
            } as ParticipantRow
        });
    const groups = groupBy(mappedRows, (p) => p.orderedValue());
    const groupedData = Array.from(groups.entries())
        .map(([key, value]) => {
            return {orderedValue: key, participants: value} as ParticipantRowGroup
        })
        .sort((a, b) => a.orderedValue - b.orderedValue);

    const table = useReactTable({
        columns: columns,
        data: groupedData,
        getCoreRowModel: getCoreRowModel(),
        getRowId: row => row.orderedValue.toString(),
    });

    function handleDragEnd(event: DragEndEvent) {
        const {active, over} = event;
        if (active && over && active.id !== over.id) {
            const oldIndex = groupedData.findIndex(p => p.orderedValue.toString() === active.id);
            const newIndex = groupedData.findIndex(p => p.orderedValue.toString() === over.id);
            const newData = arrayMove(groupedData, oldIndex, newIndex);
            const reorderedData = newData.flatMap(d => d.participants);
            onDataReordered(reorderedData);
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
                    items={groupedData.map(g => g.orderedValue.toString())}
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

function getColumnDefinition(): ColumnDef<ParticipantRowGroup, any>[] {
    const columnHelper = createColumnHelper<ParticipantRowGroup>();
    return [
        columnHelper.display({
            id: 'drag-handle',
            header: 'Move',
            cell: ({row}) => <RowDragHandleCell rowId={row.id}/>,
            size: 60,
        }),
        columnHelper.accessor('orderedValue', {
            id: 'ordering',
            header: '#',
            size: 60,
        }),
        columnHelper.display({
            id: 'row-data',
            header: '',
            cell: ({row}) => <InnerTable key={row.original.orderedValue} data={row.original.participants}/>,
        }),
    ];
}

type RowDragHandleCellProps = {
    rowId: string,
}

type InnerTableProps = {
    data: ParticipantRow[],
}

function InnerTable({data}: InnerTableProps) {
    const columns = useMemo<ColumnDef<ParticipantRow, any>[]>(() => getInnerTableColumnDefinition(), []);
    const table = useReactTable({
        columns: columns,
        data: data,
        getCoreRowModel: getCoreRowModel(),
        getRowId: row => row.player.id,
    });
    return (
        <table className='dnd-participant-list'>
            <tbody>
            {table.getRowModel().rows.map(row => (
                <tr key={row.id}>
                    {row.getVisibleCells().map(cell => (
                        <td key={cell.id} style={{width: cell.column.getSize()}}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                    ))}
                </tr>
            ))}
            </tbody>
        </table>
    );
}

function getInnerTableColumnDefinition(): ColumnDef<ParticipantRow, any>[] {
    const columnHelper = createColumnHelper<ParticipantRow>();
    return [
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

function RowDragHandleCell({rowId}: RowDragHandleCellProps) {
    const {attributes, listeners} = useSortable({
        id: rowId,
    });

    return (
        <FaGripLines {...attributes} {...listeners} className='move-row-icon'/>
    )
}

type DraggableRowProps = {
    row: Row<ParticipantRowGroup>,
}

function DraggableRow({row}: DraggableRowProps) {
    const {transform, transition, setNodeRef, isDragging} = useSortable({
        id: row.original.orderedValue.toString(),
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

function groupBy<T, K>(values: T[], grouping: (value: T) => K): Map<K, T[]> {
    const map = new Map<K, T[]>();
    values.forEach(v => {
        const key = grouping(v);
        if (!map.has(key)) {
            map.set(key, [v]);
        } else {
            map.get(key)!.push(v);
        }
    })
    return map;
}
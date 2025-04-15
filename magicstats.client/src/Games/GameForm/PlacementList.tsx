import {
    ColumnDef,
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    Row,
    RowSelectionState,
    useReactTable,
    VisibilityState
} from "@tanstack/react-table";
import {CSSProperties, useMemo, useState} from "react";
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
        'dragHandle': true,
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

    function handleDragEnd(event: DragEndEvent) {
        const {active, over} = event;
        if (active && over && active.id !== over.id) {
            const oldIndex = sortedData.findIndex(p => p.player.id === active.id);
            const newIndex = sortedData.findIndex(p => p.player.id === over.id);
            const newData = arrayMove(sortedData, oldIndex, newIndex);
            newData.forEach((p, i) => p.placement = i);
            onPlacementsChanged(newData);
        }
    }

    const sensors = useSensors(
        useSensor(MouseSensor, {}),
        useSensor(TouchSensor, {}),
        useSensor(KeyboardSensor, {}),
    )

    function toggleDrawsView(draws: boolean) {
        table.getColumn('select')!.toggleVisibility(draws);
        table.getColumn('dragHandle')!.toggleVisibility(!draws);
    }

    return (
        <div>
            <div className='draw-buttons'>
                {
                    table.getColumn('select')!.getIsVisible() ?
                        <>
                            <button disabled={Object.keys(rowSelection).length <= 1} onClick={(e) => {
                                e.stopPropagation();
                                handleDraw();
                                table.resetRowSelection();
                                toggleDrawsView(false);
                            }}>
                                Confirm
                            </button>
                            <button onClick={(e) => {
                                e.stopPropagation();
                                table.resetRowSelection();
                                toggleDrawsView(false);
                            }}>
                                Close
                            </button>
                        </>
                        :
                        <button onClick={(e) => {
                            e.stopPropagation();
                            toggleDrawsView(true);
                        }}>
                            Add a draw
                        </button>
                }
            </div>
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
                            <DraggableRow key={row.id} row={row}/>
                        ))}
                    </SortableContext>
                    </tbody>
                </table>
            </DndContext>
        </div>
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
    const {attributes, listeners, setNodeRef} = useSortable({
        id: rowId,
    });

    return (
        <div ref={setNodeRef}>
            <FaGripLines {...attributes} {...listeners} className='move-row-icon'/>
        </div>
    )
}

type DraggableRowProps = {
    row: Row<Participant>,
    stylePlacement?: boolean,
}

function DraggableRow({row}: DraggableRowProps) {
    const {transform, transition, setNodeRef, isDragging} = useSortable({
        id: row.original.player.id,
    });

    const placementColors = ['gold', 'silver', 'orange'];
    const style: CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition: transition,
        opacity: isDragging ? 0.8 : 1,
        zIndex: isDragging ? 1 : 0,
        position: 'relative',
        background: row.original.placement < placementColors.length ? placementColors[row.original.placement] : undefined,
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

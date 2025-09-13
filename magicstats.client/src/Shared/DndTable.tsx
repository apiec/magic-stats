import {IconButton, Table} from "@radix-ui/themes";
import {Table as TanstackTable} from "@tanstack/react-table";
import {flexRender, Row} from "@tanstack/react-table";
import {CSSProperties} from "react";
import {CSS} from '@dnd-kit/utilities';
import {SortableContext, useSortable, verticalListSortingStrategy} from "@dnd-kit/sortable";
import {DragHandleDots2Icon} from "@radix-ui/react-icons";
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core";
import {restrictToVerticalAxis} from "@dnd-kit/modifiers";

type DndTableParams<T> = {
    table: TanstackTable<T>,
    onItemsSwap: (rowAId: string, rowBId: string) => void;
};
export default function DndTable<T>({table, onItemsSwap}: DndTableParams<T>) {
    function handleDragEnd(event: DragEndEvent) {
        const {active, over} = event;
        if (active && over && active.id !== over.id) {
            onItemsSwap(active.id.toString(), over.id.toString());
        }
    }

    const sensors = useSensors(
        useSensor(MouseSensor, {}),
        useSensor(TouchSensor, {}),
        useSensor(KeyboardSensor, {}),
    );
    return (
        <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}>
            <Table.Root variant='ghost'>
                <Table.Header>
                    {table.getHeaderGroups().map(headerGroup => (
                        <Table.Row key={headerGroup.id}>
                            <Table.Cell>
                                Move
                            </Table.Cell>
                            {headerGroup.headers.map(header => (
                                <Table.Cell key={header.id} colSpan={header.colSpan}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                </Table.Cell>
                            ))}
                        </Table.Row>
                    ))}
                </Table.Header>
                <Table.Body>
                    <SortableContext
                        items={table.getRowModel().rows.map(row => row.id)}
                        strategy={verticalListSortingStrategy}>
                        {table.getRowModel().rows.map(row => (
                            <DraggableRow key={row.id} row={row}/>
                        ))}
                    </SortableContext>
                </Table.Body>
            </Table.Root>
        </DndContext>
    );
}

type RowDragHandleCellProps = {
    rowId: string,
}

function RowDragHandleCell({rowId}: RowDragHandleCellProps) {
    const {attributes, listeners} = useSortable({
        id: rowId,
    });

    return (
        <IconButton {...attributes} {...listeners} asChild size='2' variant='ghost'>
            <DragHandleDots2Icon/>
        </IconButton>
    )
}

type DraggableRowProps<T> = {
    row: Row<T>,
}

function DraggableRow<T>({row}: DraggableRowProps<T>) {
    const {transform, transition, setNodeRef, isDragging} = useSortable({
        id: row.id,
    });

    const style: CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition: transition,
        opacity: isDragging ? 0.8 : 1,
        zIndex: isDragging ? 1 : 0,
        position: 'relative',
    }

    return (
        <Table.Row align='center' ref={setNodeRef} style={style}>
            <Table.Cell>
                <RowDragHandleCell rowId={row.id}/>
            </Table.Cell>
            {row.getVisibleCells().map(cell => (
                <Table.Cell justify='start' key={cell.id} style={{width: cell.column.getSize()}}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Table.Cell>
            ))}
        </Table.Row>
    );
}

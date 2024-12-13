import {HeaderContext} from "@tanstack/react-table";
import {CommanderWithStats} from "../Commanders/CommanderApi";
import {FaSort, FaSortDown, FaSortUp} from 'react-icons/fa';

type SortableHeaderProps = {
    text: string,
    context: HeaderContext<CommanderWithStats, any>,
}

export default function SortableHeader({text, context}: SortableHeaderProps) {
    function handleSort() {
        context.table.setState(state => {
            if (state.sorting[0].id === context.column.id) {
                state.sorting[0].desc = !state.sorting[0].desc;
            } else {
                state.sorting[0] = {id: context.column.id, desc: context.column.id !== 'name'};
            }

            return state;
        });
    }

    function sortingIcon() {
        const ownId = context.column.id;
        const sort = context.table.getState().sorting[0];
        if (ownId !== sort.id) {
            return <FaSort className='sort-icon inactive-sort'/>
        }
        return sort.desc ? <FaSortDown className='sort-icon'/> : <FaSortUp className='sort-icon'/>
    }

    return (
        <div className='sortable-header' onClick={e => {
            e.stopPropagation();
            handleSort();
        }}>
            <p>{text}</p>
            {sortingIcon()}
        </div>
    );
}

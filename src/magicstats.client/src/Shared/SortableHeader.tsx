import {HeaderContext} from "@tanstack/react-table";
import {FaSort, FaSortDown, FaSortUp} from 'react-icons/fa';
import {Flex, Text} from '@radix-ui/themes';
import './SortableHeader.css';

type SortableHeaderProps = {
    text: string,
    context: HeaderContext<any, any>,
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
        <Flex className='sortable-header' pl='3' pr='1' gap='1' justify='center' align='center'
              onClick={e => {
                  e.stopPropagation();
                  handleSort();
              }}>
            <Text>{text}</Text>
            {sortingIcon()}
        </Flex>
    );
}

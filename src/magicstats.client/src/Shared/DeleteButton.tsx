import { Cross1Icon } from "@radix-ui/react-icons";
import { IconButton } from "@radix-ui/themes";

type DeleteButtonProps = {
    onClick: () => void;
}

export default function DeleteButton({onClick}: DeleteButtonProps) {
    return <IconButton size='1' variant='ghost' color='red' onClick={(e) => {
        e.stopPropagation();
        onClick();
    }}>
        <Cross1Icon/>
    </IconButton>
}

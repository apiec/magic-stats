import {Avatar, AvatarProps} from "@radix-ui/themes";
import {accentColors} from "@radix-ui/themes/props";
import {Player} from "./PlayerApi.ts";

type PlayerAvatarProps = Omit<AvatarProps, 'fallback'> & {
    player: Player;
}

export function PlayerAvatar({player, ...props}: PlayerAvatarProps) {
    const i = 1234 * parseInt(player.id) % accentColors.length; // 1234 is a random number to get a more random spread of colors
    return <Avatar color={accentColors[i]}
                   fallback={player.name.slice(0, 1)}
                   {...props}
    />
}
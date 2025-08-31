import {Commander} from "./CommanderApi.ts";

export function getCommanderDisplayName(commander: Commander): string {
    return commander.card?.name
        ? commander.card.name + (commander.partner ? ' // ' + commander.partner.name : '')
        : commander.name;
}
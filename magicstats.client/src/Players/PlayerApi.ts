import {TableApi, TableEntry} from "../Shared/SimpleTable/TableApi.ts";
import {Player} from "../Games/GameApi.ts";

interface PlayerDto {
    id: string,
    name: string;
}

interface GetPlayersResponse {
    players: PlayerDto[];
}

interface CreatePlayerRequest {
    name: string;
}

interface CreatePlayerResponse {
    id: string;
}

interface PlayerEntry extends TableEntry {
}

export default class PlayerApi implements TableApi<PlayerEntry> {
    private basePath: string = 'api/players/';

    async getAll(): Promise<Player[]> {
        const rawResponse = await fetch(this.basePath);
        const response = await rawResponse.json() as GetPlayersResponse;
        return response.players;
    }

    async getAllAsTableEntries(): Promise<PlayerEntry[]> {
        const rawResponse = await fetch(this.basePath);
        const response = await rawResponse.json() as GetPlayersResponse;
        return response.players.map(
            c => ({id: c.id, contents: c.name} as PlayerEntry));
    }

    async create(entry: PlayerEntry): Promise<PlayerEntry> {
        const request = {name: entry.contents} as CreatePlayerRequest;
        const rawResponse = await fetch(this.basePath, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        });
        const response = await rawResponse.json() as CreatePlayerResponse;
        return {
            id: response.id,
            contents: entry.contents
        } as PlayerEntry;
    }

    async delete(id: string): Promise<void> {
        await fetch(this.basePath + id, {method: 'DELETE'});
    }
}
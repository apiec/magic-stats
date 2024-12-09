import {TableApi, TableEntry} from "../Shared/SimpleTable/TableApi.ts";
import {Player} from "../Games/GamesApi.ts";
import Api from "../api/Api.ts";

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
    private path: string = 'players/';
    private api: Api = new Api();

    async getAll(): Promise<Player[]> {
        const response = await this.api.get<GetPlayersResponse>(this.path);
        return response.players;
    }

    async getAllAsTableEntries(): Promise<PlayerEntry[]> {
        const players = await this.getAll();
        return players.map(p => ({id: p.id, contents: p.name} as PlayerEntry));
    }

    async create(entry: PlayerEntry): Promise<PlayerEntry> {
        const request = {name: entry.contents} as CreatePlayerRequest;
        const response = await this.api.post<CreatePlayerRequest, CreatePlayerResponse>(
            this.path,
            request);
        return {
            id: response.id,
            contents: entry.contents
        } as PlayerEntry;
    }

    async delete(id: string): Promise<void> {
        await this.api.delete(this.path + id);
    }
}
import Api from "../api/Api.ts";

export type Player = {
    id: string,
    name: string,
}

type GetPlayersResponse = {
    players: Player[];
}

type GetPlayersWithStatsResponse = {
    players: PlayerWithStats[];
}

type CreatePlayerRequest = {
    name: string;
}

type CreatePlayerResponse = {
    id: string;
}

export type PlayerWithStats = {
    id: string,
    name: string,
    stats: PlayerStats,
}

export type PlayerStats = {
    wins: number,
    games: number,
    winrate: number,
    winrateLast10: number,
}

export default class PlayerApi {
    private path: string = 'players/';
    private api: Api = new Api();

    async getAll(): Promise<Player[]> {
        const response = await this.api.get<GetPlayersResponse>(this.path);
        return response.players;
    }

    async getAllWithStats(): Promise<PlayerWithStats[]> {
        const response = await this.api.get<GetPlayersWithStatsResponse>(this.path + 'stats');
        return response.players;
    }

    async create(name: string): Promise<string> {
        const request = {name: name} as CreatePlayerRequest;
        const response = await this.api.post<CreatePlayerRequest, CreatePlayerResponse>(
            this.path,
            request);
        return response.id.toString(); // todo: make them as string in backend
    }

    async delete(id: string): Promise<void> {
        await this.api.delete(this.path + id);
    }
}
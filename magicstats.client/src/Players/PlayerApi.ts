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
    winrateLastX: number,
}

type GetPlayerWinratesResponse = {
    playerWinrates: PlayerWithWinrates[],
}

export type PlayerWithWinrates = {
    id: number,
    name: string,
    dataPoints: DataPoint[],
}

export type DataPoint = {
    date: string,
    winrate: number,
}

export default class PlayerApi {
    private path: string = 'players/';
    private api: Api = new Api();

    async getAll(): Promise<Player[]> {
        const response = await this.api.get<GetPlayersResponse>(this.path);
        return response.players;
    }

    async getAllWithStats(windowSize: number): Promise<PlayerWithStats[]> {
        const path = this.path + 'stats' + (windowSize ? '?windowSize=' + windowSize : '');
        const response = await this.api.get<GetPlayersWithStatsResponse>(path);
        return response.players;
    }

    async getWinrates(slidingWindowSize?: number): Promise<PlayerWithWinrates[]> {
        const path = this.path + 'winrates' + (slidingWindowSize ? '?slidingWindowSize=' + slidingWindowSize : '');
        const response = await this.api.get<GetPlayerWinratesResponse>(path);
        return response.playerWinrates;
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
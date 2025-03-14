﻿import Api from "../api/Api.ts";

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
    id: string,
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

    async getAllWithStats(windowSize: number, podSize?: number): Promise<PlayerWithStats[]> {
        const queryParams = new URLSearchParams();
        queryParams.append('windowSize', windowSize.toString());
        if (podSize !== undefined) {
            queryParams.append('podSize', podSize.toString());
        }
        const query = queryParams.size > 0 ? '?' + queryParams.toString() : '';

        const path = this.path + 'stats' + query;
        const response = await this.api.get<GetPlayersWithStatsResponse>(path);
        return response.players;
    }

    async getStatsForPod(playerIds: string[], windowSize: number): Promise<PlayerWithStats[]> {
        const queryParams = new URLSearchParams();
        queryParams.append('windowSize', windowSize.toString());
        playerIds.forEach(id => queryParams.append('playerIds', id));
        const query = queryParams.size > 0 ? '?' + queryParams.toString() : '';

        const path = this.path + 'stats' + query;
        const response = await this.api.get<GetPlayersWithStatsResponse>(path);
        return response.players;
    }

    async getWinrates(slidingWindowSize?: number, podSize?: number): Promise<PlayerWithWinrates[]> {
        const queryParams = new URLSearchParams();

        if (slidingWindowSize !== undefined) {
            queryParams.append('slidingWindowSize', slidingWindowSize.toString());
        }
        if (podSize !== undefined) {
            queryParams.append('podSize', podSize.toString());
        }

        const query = queryParams.size > 0 ? '?' + queryParams.toString() : '';
        const path = this.path + 'winrates' + query;
        const response = await this.api.get<GetPlayerWinratesResponse>(path);
        return response.playerWinrates;
    }

    async getWinratesForPod(playerIds: string[], slidingWindowSize?: number): Promise<PlayerWithWinrates[]> {
        const queryParams = new URLSearchParams();

        if (slidingWindowSize !== undefined) {
            queryParams.append('slidingWindowSize', slidingWindowSize.toString());
        }
        playerIds.forEach(id => queryParams.append('playerIds', id.toString()));

        const query = queryParams.size > 0 ? '?' + queryParams.toString() : '';
        const path = this.path + 'winrates' + query;
        const response = await this.api.get<GetPlayerWinratesResponse>(path);
        return response.playerWinrates;
    }

    async create(name: string): Promise<Player> {
        const request = {name: name} as CreatePlayerRequest;
        return await this.api.post<CreatePlayerRequest, Player>(this.path, request);
    }

    async delete(id: string): Promise<void> {
        await this.api.delete(this.path + id);
    }
}
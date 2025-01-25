import Api from "../api/Api.ts";

export type Commander = {
    id: string,
    name: string,
}
export type CommanderWithStats = {
    id: string,
    name: string,
    stats: CommanderStats,
}
export type CommanderStats = {
    wins: number,
    games: number,
    winrate: number,
    winrateLastX: number,
}

type GetCommandersResponse = {
    commanders: Commander[];
}

type GetCommandersWithStatsResponse = {
    commanders: CommanderWithStats[];
}

type GetCommanderWinratesResponse = {
    commanderWinrates: CommanderWithWinrates[],
}

export type CommanderWithWinrates = {
    id: number,
    name: string,
    dataPoints: DataPoint[],
}

export type DataPoint = {
    date: string,
    winrate: number | undefined,
}

type CreateCommanderRequest = {
    name: string;
}

type CreateCommanderResponse = {
    id: string;
}

export default class CommanderApi {
    private path: string = 'commanders/';
    private api = new Api();

    async getAll(): Promise<Commander[]> {
        const response = await this.api.get<GetCommandersResponse>(this.path);
        return response.commanders;
    }

    async getAllWithStats(windowSize: number, podSize?: number): Promise<CommanderWithStats[]> {
        const queryParams = new URLSearchParams();
        queryParams.append('windowSize', windowSize.toString());
        if (podSize !== undefined) {
            queryParams.append('podSize', podSize.toString());
        }
        const query = queryParams.size > 0 ? '?' + queryParams.toString() : '';

        const path = this.path + 'stats' + query;
        const response = await this.api.get<GetCommandersWithStatsResponse>(path);
        return response.commanders;
    }

    async getWinrates(slidingWindowSize?: number, podSize?: number): Promise<CommanderWithWinrates[]> {
        const queryParams = new URLSearchParams();

        if (slidingWindowSize !== undefined) {
            queryParams.append('slidingWindowSize', slidingWindowSize.toString());
        }
        if (podSize !== undefined) {
            queryParams.append('podSize', podSize.toString());
        }

        const query = queryParams.size > 0 ? '?' + queryParams.toString() : '';
        const path = this.path + 'winrates' + query;
        const response = await this.api.get<GetCommanderWinratesResponse>(path);
        return response.commanderWinrates;
    }

    async create(name: string): Promise<string> {
        const request = {name: name} as CreateCommanderRequest;
        const response = await this.api.post<CreateCommanderRequest, CreateCommanderResponse>(this.path, request);
        return response.id.toString(); // todo: make those strings in api
    }

    async delete(id: string): Promise<void> {
        await this.api.delete(this.path + id);
    }
}
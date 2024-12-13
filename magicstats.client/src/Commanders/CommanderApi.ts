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
    winrateLast10: number,
}

type GetCommandersResponse = {
    commanders: Commander[];
}

type GetCommandersWithStatsResponse = {
    commanders: CommanderWithStats[];
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

    async getAllWithStats(): Promise<CommanderWithStats[]> {
        const response = await this.api.get<GetCommandersWithStatsResponse>(this.path + 'stats');
        return response.commanders;
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
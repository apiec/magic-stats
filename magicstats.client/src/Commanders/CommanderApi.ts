import Api from "../api/Api.ts";

export type Commander = {
    id: string,
    name: string,
    card: Card | undefined,
    partner: Card | undefined,
}

export type Card = {
    id: string,
    name: string,
    scryfallId: string,
    scryfallUri: string,
    images: CommanderImageUris,
    otherFaceImages: CommanderImageUris | undefined,
}

export type CommanderImageUris = {
    png: string,
    borderCrop: string,
    artCrop: string,
    large: string,
    normal: string,
    small: string,
}

export type CommanderWithStats = Commander & {
    stats: CommanderStats,
}

export type CommanderStats = {
    wins: number,
    games: number,
    winrate: number,
    winrateLastX: number,
}

export type SingleCommanderWithStats = Commander & {
    stats: SingleCommanderStats
}

export type SingleCommanderStats = {
    wins: number,
    games: number,
    winrate: number,
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
    id: string,
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

type UpdateCommanderRequest = {
    name?: string,
    cardId?: string,
    partnerId?: string,
}
export default class CommanderApi {
    private path: string = 'commanders/';
    private api = new Api();

    async get(commanderId: string): Promise<SingleCommanderWithStats> {
        return await this.api.get<SingleCommanderWithStats>(this.path + commanderId);
    }

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

    async create(name: string): Promise<Commander> {
        const request = {name: name} as CreateCommanderRequest;
        return await this.api.post<CreateCommanderRequest, Commander>(this.path, request);
    }

    async delete(id: string): Promise<void> {
        await this.api.delete(this.path + id);
    }

    async update(commander: Commander): Promise<Commander> {
        const request = {
            name: commander.name,
            cardId: commander.card?.id,
            partnerId: commander.partner?.id,
        } as UpdateCommanderRequest;
        return await this.api.put<UpdateCommanderRequest, Commander>(this.path + commander.id, request)
    }
}
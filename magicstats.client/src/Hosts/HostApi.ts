import Api from "../api/Api.ts";

export type Host = {
    id: string,
    name: string,
    irl: boolean,
}

export type HostWithStats = {
    id: string,
    name: string,
    irl: boolean,
    games: number,
}

type GetHostsResponse = {
    hosts: Host[];
}

type GetHostsWithStatsResponse = {
    hosts: HostWithStats[];
}

type CreateHostRequest = {
    name: string;
    irl: boolean;
}

type CreateHostResponse = {
    id: string;
}

export default class HostApi {
    private path: string = 'hosts/';
    private api = new Api();

    async getAll(): Promise<Host[]> {
        const response = await this.api.get<GetHostsResponse>(this.path);
        return response.hosts;
    }

    async getAllWithStats(): Promise<HostWithStats[]> {
        const path = this.path + 'stats';
        const response = await this.api.get<GetHostsWithStatsResponse>(path);
        return response.hosts;
    }

    async create(name: string, irl: boolean): Promise<string> {
        const request = {name: name, irl: irl} as CreateHostRequest;
        const response = await this.api.post<CreateHostRequest, CreateHostResponse>(this.path, request);
        return response.id.toString();
    }

    async delete(id: string): Promise<void> {
        await this.api.delete(this.path + id);
    }
}
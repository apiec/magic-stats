import Api from "../api/Api.ts";

export type Pod = {
    players: Player[],
    games: number,
    size: number,
}

export type Player = {
    id: string,
    name: string,
}

type GetPodsResponse = {
    pods: Pod[],
}

export default class PodApi {
    private path: string = 'pods/';
    private api: Api = new Api();

    async getAll(): Promise<Pod[]> {
        const response = await this.api.get<GetPodsResponse>(this.path);
        response.pods.forEach(p => p.size = p.players.length);
        return response.pods;
    }
}
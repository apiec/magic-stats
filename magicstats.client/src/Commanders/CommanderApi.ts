import {TableApi, TableEntry} from "../Shared/SimpleTable/TableApi.ts";
import {Commander} from "../Games/GamesApi.ts";
import Api from "../api/Api.ts";

interface CommanderDto {
    id: string,
    name: string;
}

interface GetCommandersResponse {
    commanders: CommanderDto[];
}

interface CreateCommanderRequest {
    name: string;
}

interface CreateCommanderResponse {
    id: string;
}

interface CommanderEntry extends TableEntry {
}

export default class CommanderApi implements TableApi<CommanderEntry> {
    private path: string = 'commanders/';
    private api = new Api();

    async getAll(): Promise<Commander[]> {

        const response = await this.api.get<GetCommandersResponse>(this.path);
        return response.commanders;
    }

    async getAllAsTableEntries(): Promise<CommanderEntry[]> {
        const commanders = await this.getAll();
        return commanders.map(c => ({id: c.id, contents: c.name} as CommanderEntry));
    }

    async create(entry: CommanderEntry): Promise<CommanderEntry> {
        const request = {name: entry.contents} as CreateCommanderRequest;
        const response = await this.api.post<CreateCommanderRequest, CreateCommanderResponse>(this.path, request);
        return {
            id: response.id,
            contents: entry.contents
        } as CommanderEntry;
    }

    async delete(id: string): Promise<void> {
        await this.api.delete(this.path + id);
    }
}

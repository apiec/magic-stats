import {TableApi, TableEntry} from "../Shared/SimpleTable/TableApi.ts";
import {Commander} from "../Games/GameApi.ts";

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
    private basePath: string = 'api/commanders/';

    async getAll(): Promise<Commander[]> {
        const rawResponse = await fetch(this.basePath);
        const response = await rawResponse.json() as GetCommandersResponse;
        return response.commanders;
    }

    async getAllAsTableEntries(): Promise<CommanderEntry[]> {
        const rawResponse = await fetch(this.basePath);
        const response = await rawResponse.json() as GetCommandersResponse;
        return response.commanders.map(
            c => ({id: c.id, contents: c.name} as CommanderEntry));
    }

    async create(entry: CommanderEntry): Promise<CommanderEntry> {
        const request = {name: entry.contents} as CreateCommanderRequest;
        const rawResponse = await fetch(this.basePath, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        });
        const response = await rawResponse.json() as CreateCommanderResponse;
        return {
            id: response.id,
            contents: entry.contents
        } as CommanderEntry;
    }

    async delete(id: string): Promise<void> {
        await fetch(this.basePath + id, {method: 'DELETE'});
    }

}

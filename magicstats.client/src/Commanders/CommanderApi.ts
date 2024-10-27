const BasePath: string = 'api/commanders/';

export default interface CommanderData {
    commanders: Commander[];
}

export interface Commander {
    name: string,
    id: string,
}


export async function GetCommanders(): Promise<CommanderData> {
    const response = await fetch(BasePath);
    return await response.json();
}

export interface CreateCommanderRequest {
    name: string;
}

export interface CreateCommanderResponse {
    id: string;
    name: string;
}

export async function CreateCommander(request: CreateCommanderRequest): Promise<CreateCommanderResponse> {
    const response = await fetch(BasePath, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
    } as RequestInit);
    const content = await response.json() as CreateCommanderResponse;
    content.name = request.name;
    return content;
}

export interface DeleteCommanderRequest {
    id: string;
}

export async function DeleteCommander(request: DeleteCommanderRequest) {
    await fetch(BasePath + request.id, {method: 'DELETE',});
}

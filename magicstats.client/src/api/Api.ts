export default class Api {
    private baseUrl = window.location.origin + '/api/';

    async get<T>(path: string): Promise<T> {
        const response = await fetch(this.baseUrl + path);
        return await response.json() as T;
    }

    async post<TBody, TResponse>(path: string, body: TBody): Promise<TResponse> {
        const rawResponse = await fetch(this.baseUrl + path, {
            method: "POST",
            headers: {"Content-Type": "application/json",},
            body: JSON.stringify(body),
        });
        return await rawResponse.json() as TResponse;
    }

    async postNoResponse<TBody>(path: string, body: TBody) {
        await fetch(this.baseUrl + path, {
            method: "POST",
            headers: {"Content-Type": "application/json",},
            body: JSON.stringify(body),
        });
    }

    async delete(path: string): Promise<void> {
        await fetch(this.baseUrl + path, {method: "DELETE"});
    }

    async put<TBody, TResponse>(path: string, body: TBody) {
        const rawResponse = await fetch(this.baseUrl + path, {
            method: "PUT",
            headers: {"Content-Type": "application/json",},
            body: JSON.stringify(body),
        });
        return await rawResponse.json() as TResponse;
    }

    async putNoResponse<TBody>(path: string, body: TBody) {
        await fetch(this.baseUrl + path, {
            method: "PUT",
            headers: {"Content-Type": "application/json",},
            body: JSON.stringify(body),
        });
    }
}

const baseUrl = "https://localhost:5173/api/";

export default class Api {
    async get<T>(path: string): Promise<T> {
        const response = await fetch(baseUrl + path);
        return await response.json() as T;
    }

    async post<TBody, TResponse>(path: string, body: TBody): Promise<TResponse> {
        const rawResponse = await fetch(baseUrl + path, {
            method: "POST",
            headers: {"Content-Type": "application/json",},
            body: JSON.stringify(body),
        });
        return await rawResponse.json() as TResponse;
    }

    async postNoResponse<TBody>(path: string, body: TBody) {
        await fetch(baseUrl + path, {
            method: "POST",
            headers: {"Content-Type": "application/json",},
            body: JSON.stringify(body),
        });
    }

    async delete(path: string): Promise<void> {
        await fetch(baseUrl + path, {method: "DELETE"});
    }

    async put<TBody>(path: string, body: TBody) {
        await fetch(baseUrl + path, {
            method: "PUT",
            headers: {"Content-Type": "application/json",},
            body: JSON.stringify(body),
        });
    }
}
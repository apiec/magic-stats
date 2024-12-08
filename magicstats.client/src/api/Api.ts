const baseUrl = 'https://localhost:5173/api/';

export async function get<T>(path: string): Promise<T> {
    const response = await fetch(baseUrl + path);
    return await response.json() as T;
}

export async function post<TBody, TResponse>(path: string, body: TBody): Promise<TResponse> {
    const rawResponse = await fetch(baseUrl + path, {
        method: 'POST',
        headers: {"Content-Type": "application/json",},
        body: JSON.stringify(body),
    });
    return await rawResponse.json() as TResponse;
}

export async function del(path: string): Promise<void> {
    await fetch(baseUrl + path, {method: 'DELETE'});
}

export async function put<TBody, TResponse>(path: string, body: TBody) {
    const rawResponse = await fetch(baseUrl + path, {
        method: 'PUT',
        headers: {"Content-Type": "application/json",},
        body: JSON.stringify(body),
    });
    return await rawResponse.json() as TResponse;
}
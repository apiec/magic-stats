export interface TableEntry {
    id: string;
    contents: string;
}

export interface TableApi<T extends TableEntry> {
    getAll(): Promise<T[]>;

    create(entry: T): Promise<T>;

    delete(id: string): Promise<void>;
}
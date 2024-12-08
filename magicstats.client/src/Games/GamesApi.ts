import Api from "../api/Api.ts";

export type Game = {
    id: string,
    lastModified: Date,
    playedAt: Date,
    participants: Participant[],
    winner: Participant | undefined,
}

export type Participant = {
    commander: Commander,
    player: Player,
    startingOrder: number,
    placement: number,
}

export type Commander = {
    id: string,
    name: string,
}

export type Player = {
    id: string,
    name: string,
}

export type NewParticipantDto = {
    playerId: string,
    commanderId: string,
    startingOrder: number,
    placement: number,
}

export type AddParticipantRequest = {
    playerId: string,
    commanderId: string,
}

export type CreateGameRequest = {
    playedAt: Date,
    participants: NewParticipantDto[],
}
export type CreateGameResponse = {
    id: string,
}

type GetGamesResponse = {
    games: Game[],
}

export class GamesApi {
    private path: string = "games/";
    private api = new Api();

    async getAll(): Promise<Game[]> {
        const response = await this.api.get<GetGamesResponse>(this.path);
        return response.games;
    }

    async get(gameId: string): Promise<Game> {
        const response = await this.api.get<Game>(this.path + gameId);
        // todo: unhack this bullshit
        response.playedAt = new Date(response.playedAt);
        response.lastModified = new Date(response.lastModified);
        return response;
    }

    async createNewGame(): Promise<string> {
        const request = {playedAt: new Date(), participants: []} as CreateGameRequest;
        const response = await this.api.post<CreateGameRequest, CreateGameResponse>(this.path, request);
        return response.id.toString();
    }

    async delete(gameId: string): Promise<void> {
        await fetch(this.path + gameId, {method: 'DELETE'});
    }

    async updatePlayedAt(gameId: string, playedAt: Date): Promise<void> {
        const request = {playedAt: playedAt};
        const response = await this.api.put(this.path + gameId, request);
        console.log(response);
    }

    async addParticipant(gameId: string, participant: AddParticipantRequest): Promise<Participant> {
        return await this.api.post<AddParticipantRequest, Participant>(
            this.path + gameId + '/participants',
            participant);
    }

    async deleteParticipant(gameId: string, playerId: string) {
        await this.api.delete(this.participantPath(gameId, playerId));
    }

    async updatePlacement(gameId: string, playerIds: string[]) {
        const request = {participantPlacements: playerIds};
        await this.api.postNoResponse(this.path + gameId + '/participants/placement', request);
    }

    async updateStartingOrder(gameId: string, playerIds: string[]) {
        const request = {participantStartingOrder: playerIds};
        await this.api.postNoResponse(this.path + gameId + '/participants/starting-order', request);
    }

    private participantPath(gameId: string, playerId: string) {
        return `${this.path}${gameId}/participants/${playerId}`;
    }
}

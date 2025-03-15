import Api from "../api/Api.ts";
import {Player} from "../Players/PlayerApi.ts";
import {Commander} from "../Commanders/CommanderApi.ts";

export type Game = {
    id: string,
    lastModified: Date,
    playedAt: Date,
    host: string,
    irl: boolean,
    turns?: number,
    participants: Participant[],
    winner: Participant | undefined,
}

export type Participant = {
    commander: Commander,
    player: Player,
    startingOrder: number,
    placement: number,
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

type UpdateGameRequest = {
    playedAt?: Date;
    hostId?: string;
    turnCount?: number;
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

    async createNewGame(): Promise<Game> {
        const request = {playedAt: new Date(), participants: []} as CreateGameRequest;
        return await this.api.post<CreateGameRequest, Game>(this.path, request);
    }

    async delete(gameId: string): Promise<void> {
        await this.api.delete(this.path + gameId);
    }

    async updatePlayedAt(gameId: string, playedAt: Date): Promise<void> {
        const request = {playedAt: playedAt} as UpdateGameRequest;
        await this.api.put(this.path + gameId, request);
    }

    async updateHost(gameId: string, hostId: string): Promise<void> {
        const request = {hostId: hostId} as UpdateGameRequest;
        await this.api.put(this.path + gameId, request);
    }

    async updateTurnCount(gameId: string, turnCount: number | undefined): Promise<void> {
        const request = {turnCount: turnCount} as UpdateGameRequest;
        await this.api.put(this.path + gameId, request);
    }

    async addParticipant(gameId: string, participant: AddParticipantRequest): Promise<Participant> {
        return await this.api.post<AddParticipantRequest, Participant>(
            this.path + gameId + '/participants',
            participant);
    }

    async deleteParticipant(gameId: string, playerId: string) {
        await this.api.delete(this.participantPath(gameId, playerId));
    }

    async updatePlacement(gameId: string, placements: Placements) {
        const request = {participantPlacements: placements};
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

export interface Placements {
    [key: string]: number
}
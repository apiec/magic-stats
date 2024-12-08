export type Game = {
    id: string,
    lastModified: Date,
    playedAt: Date,
    participants: Participant[],
    winner: Participant,
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

export type CreateGameRequest = {
    playedAt: Date,
    participants: NewParticipantDto[],
}


export class GamesApi {
    private basePath: string = 'api/games/';

    async getAll(): Promise<Game[]> {
        const rawResponse = await fetch(this.basePath);
        const response = await rawResponse.json() as { games: Game[] };
        return response.games;
    }

    async create(request: CreateGameRequest): Promise<string> {
        const rawResponse = await fetch(this.basePath, {
            method: 'POST',
            headers: {"Content-Type": "application/json",},
            body: JSON.stringify(request),
        });
        const response = await rawResponse.json() as { id: string };
        return response.id;
    }

    async delete(gameId: string): Promise<void> {
        await fetch(this.basePath + gameId, {method: 'DELETE'});
    }

    async updatePlayedAt(gameId: string, playedAt: Date): Promise<void> {
        const request = {playedAt: playedAt};
        await fetch(this.basePath + gameId, {
            method: 'PUT',
            headers: {"Content-Type": "application/json",},
            body: JSON.stringify(request),
        });
    }

    async addParticipant(gameId: string, participant: NewParticipantDto) {
        await fetch(this.basePath + gameId, {
            method: 'POST',
            headers: {"Content-Type": "application/json",},
            body: JSON.stringify(participant),
        });
    }

    async deleteParticipant(gameId: string, playerId: string) {
        await fetch(
            this.participantPath(gameId, playerId),
            {method: 'DELETE',}
        );
    }

    async updatePlacement(gameId: string, playerIds: string[]) {
        const request = {participantPlacements: playerIds};
        await fetch(this.basePath + gameId + '/participants/placement', {
            method: 'POST',
            headers: {"Content-Type": "application/json",},
            body: JSON.stringify(request),
        });
    }

    async updateStartingOrder(gameId: string, playerIds: string[]) {
        const request = {participantStartingOrder: playerIds};
        await fetch(this.basePath + gameId + '/participants/starting-order', {
            method: 'POST',
            headers: {"Content-Type": "application/json",},
            body: JSON.stringify(request),
        });
    }

    private participantPath(gameId: string, playerId: string) {
        return `${this.basePath}${gameId}/participants/${playerId}`;
    }
}

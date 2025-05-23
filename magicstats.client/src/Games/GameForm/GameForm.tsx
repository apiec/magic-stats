﻿import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import './GameForm.css';
import AddParticipantDialog from "./AddParticipantDialog.tsx";
import {useEffect, useRef, useState} from "react";
import StartingOrderList from "./StartingOrderList.tsx";
import {AddParticipantRequest, Game, GamesApi, Participant, Placements} from "../GamesApi.ts";
import {useParams} from "react-router-dom";
import {useImmer} from "use-immer";
import {HostPicker} from "./HostPicker.tsx";
import {Host} from "../../Hosts/HostApi.ts";
import PlacementList from "./PlacementList.tsx";

export default function GameForm() {
    const [game, setGame] = useImmer<Game | undefined>(undefined);
    const [rerender, setRerender] = useState<number>(0);
    const {gameId} = useParams<string>();

    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        populateGameData();
    }, [rerender]);

    async function populateGameData() {
        const api = new GamesApi();
        const game = await api.get(gameId!);
        setGame(game);
    }

    async function handleDeleteParticipant(playerId: string) {
        const api = new GamesApi();
        await api.deleteParticipant(game!.id, playerId);
        setRerender(rerender + 1);
    }

    if (game === undefined || game === null) {
        return (
            <p>Loading...</p>
        );
    }

    return (
        <div id='game-form-component'>
            <dialog id='participant-dialog' ref={dialogRef} onClick={(e) => {
                if (e.currentTarget === e.target) {
                    toggleDialog();
                }
            }}>
                <AddParticipantDialog onAdd={handleAddParticipant}/>
            </dialog>

            <div id='date-picker'>
                <label htmlFor='date-picker-el'>Played at:</label>
                <DatePicker
                    id='date-picker-el'
                    name='startedAt'
                    selected={game.playedAt}
                    onChange={async (newDate) => {
                        const api = new GamesApi();
                        await api.updatePlayedAt(game.id, newDate!);
                        setGame((draft) => {
                            if (draft !== undefined) {
                                draft.playedAt = newDate!;
                            }
                        });
                    }}
                    showIcon
                    showTimeSelect
                    dateFormat='dd-MM-yyyy HH:mm'
                    maxDate={new Date()}/>
            </div>

            <div id='turns'>
                <label>Turns</label>
                {
                    game.turns
                        ? <input id='turns-input' type='number' min='0' value={game.turns} onChange={e => {
                            handleTurnsChanged(e.currentTarget.valueAsNumber).then();
                        }}/>
                        : <button id='add-turns-button' onClick={() => {
                            handleTurnsChanged(1).then();
                        }}>
                            Add turn count
                        </button>
                }
            </div>

            <div id='host-picker'>
                <label>Host</label>
                <HostPicker currentHost={game.host ? {name: game.host, irl: game.irl} as Host : undefined}
                            onHostChange={host => {
                                handleHostChanged(host).then();
                            }}/>
            </div>

            <button id='add-participant-button' onClick={toggleDialog}>Add a participant</button>

            <div id='starting-order-section'>
                <h3>Starting order</h3>
                <StartingOrderList
                    participants={game.participants.slice()}
                    onParticipantDeleted={handleDeleteParticipant}
                    onStartingOrdersChanged={handleStartingOrderChanged}/>
            </div>
            <div id='placement-section'>
                <h3>Placement</h3>
                <PlacementList
                    participants={game.participants.slice()}
                    onParticipantDeleted={handleDeleteParticipant}
                    onPlacementsChanged={handlePlacementChanged}/>
            </div>
        </div>
    );

    function toggleDialog() {
        if (!dialogRef.current) {
            return;
        }
        dialogRef.current.hasAttribute("open")
            ? dialogRef.current.close()
            : dialogRef.current.showModal();
    }

    async function handleAddParticipant(newParticipant: Participant) {
        if (game === undefined) {
            return;
        }

        const api = new GamesApi();
        const request = {
            playerId: newParticipant.player.id,
            commanderId: newParticipant.commander.id,
        } as AddParticipantRequest;

        const participantResponse = await api.addParticipant(game.id, request);
        setGame((draft) => {
            if (draft !== undefined) {
                draft.participants.push(participantResponse);
            }
        })
        toggleDialog();
    }

    async function handleStartingOrderChanged(newData: Participant[]) {
        if (game === undefined) {
            return;
        }
        const api = new GamesApi();
        const sorted = newData.sort((a, b) => a.startingOrder - b.startingOrder);
        await api.updateStartingOrder(game.id, sorted.map(p => p.player.id));
        setRerender(rerender + 1);
    }

    async function handlePlacementChanged(newData: Participant[]) {
        if (game === undefined) {
            return;
        }
        const api = new GamesApi();
        const placements = {} as Placements;
        newData.forEach(p => placements[p.player.id] = p.placement);
        await api.updatePlacement(game.id, placements);
        setRerender(rerender + 1);
    }

    async function handleHostChanged(host: Host) {
        if (game === undefined) {
            return;
        }
        const api = new GamesApi();
        await api.updateHost(game.id, host.id);
        setRerender(rerender + 1);
    }

    async function handleTurnsChanged(turns: number) {
        if (game === undefined) {
            return;
        }
        const api = new GamesApi();
        await api.updateTurnCount(game.id, turns);
        setRerender(rerender + 1);
    }
}
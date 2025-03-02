import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import './GameForm.css';
import AddParticipantDialog from "./AddParticipantDialog.tsx";
import {useEffect, useRef} from "react";
import DragAndDropParticipantsList from "./DragAndDropParticipantsList.tsx";
import {AddParticipantRequest, Game, GamesApi, Participant, Placements} from "../GamesApi.ts";
import {useParams} from "react-router-dom";
import {useImmer} from "use-immer";

export default function GameForm() {
    const [game, setGame] = useImmer<Game | undefined>(undefined);

    const {gameId} = useParams<string>();

    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        populateGameData();
    }, []);

    async function populateGameData() {
        const api = new GamesApi();
        const game = await api.get(gameId!);
        setGame(game);
    }

    async function handleDeleteParticipant(playerId: string) {
        const api = new GamesApi();
        await api.deleteParticipant(game!.id, playerId);
        setGame((draft) => {
            if (draft === undefined) {
                return;
            }
            draft.participants = draft.participants.filter(p => p.player.id !== playerId);
        });
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

            <button id='add-participant-button' onClick={toggleDialog}>+1 byczq</button>

            <div id='starting-order-section'>
                <h3>Starting order</h3>
                <DragAndDropParticipantsList
                    orderedColumnName='#'
                    participants={game.participants.slice()}
                    onParticipantDeleted={handleDeleteParticipant}
                    onDataReordered={handleStartingOrderChanged}
                    orderedValueGetter={p => p.startingOrder + 1}/>
            </div>
            <div id='placement-section'>
                <h3>Placement</h3>
                <DragAndDropParticipantsList
                    stylePlacement={true}
                    orderedColumnName='#'
                    participants={game.participants.slice()}
                    onParticipantDeleted={handleDeleteParticipant}
                    onDataReordered={handlePlacementChanged}
                    orderedValueGetter={p => p.placement + 1}/>
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
        await api.updateStartingOrder(game.id, newData.map(p => p.player.id));
        setGame((draft) => {
            if (draft !== undefined) {
                newData.forEach((p, i) => {
                    const dp = draft.participants.find(dp => dp.player.id == p.player.id);
                    dp!.startingOrder = i;
                })
            }
        })
    }

    async function handlePlacementChanged(newData: Participant[]) {
        if (game === undefined) {
            return;
        }
        const api = new GamesApi();
        const placements = {} as Placements;
        newData.forEach((p, i) => placements[p.player.id] = i);
        await api.updatePlacement(game.id, placements);
        setGame((draft) => {
            if (draft !== undefined) {
                newData.forEach((p, i) => {
                    const dp = draft.participants.find(dp => dp.player.id == p.player.id);
                    dp!.placement = i;
                })
            }
        })
    }
}
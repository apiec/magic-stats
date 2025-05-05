import ValueDisplay from "../Shared/ValueDisplay.tsx";
import "./PlayerDetails.css";

type PlayerWithDetails = {
    id: string,
    name: string,
    profilePictureLink: string,
    stats: PlayerStats,
};

type PlayerStats = {
    winrates: Winrates,
    totalGames: number,
}

type Winrates = Map<string, number>;

export default function PlayerPage() {
    // todo: download player by id
    const player = {
        name: "Stefan",
        profilePictureLink: "/pfp.png",
        stats: {
            totalGames: 15,
        } as PlayerStats,
    } as PlayerWithDetails;
    return <PlayerDetails player={player}/>
}

type PlayerDetailsProps = {
    player: PlayerWithDetails,
};

function PlayerDetails({player}: PlayerDetailsProps) {
    return (
        <div className='player-content'>
            <header className='player-header'>
                <section className='player-card'>
                    <img src={player.profilePictureLink} alt='profile picture' className='player-pfp'/>
                    <h1>{player.name}</h1>
                </section>
                <section className='player-header-values'>
                    <ValueDisplay title='Total games' values={[player.stats.totalGames.toFixed(0)]}/>
                    <ValueDisplay title='All time winrate' values={[player.stats.totalGames.toFixed(0)]}/>
                    <ValueDisplay title='Winrate last 30' values={[player.stats.totalGames.toFixed(0)]}/>
                    <ValueDisplay title='Favorite commander' values={['Stella', '55']}/>
                    <ValueDisplay title='Best commander' values={['Grenzo', '45%']}/>
                </section>
            </header>
        </div>
    );
}
import { Player, Round } from "../types/models";

export interface PlayerStats {
    id: string;
    name: string;
    wins: number;
    tripletas: number;
    balance: number;
}

export function generateLeaderboard(
    players: Player[],
    rounds: Round[]
): PlayerStats[] {
    return players.map((player) => {
        const wins = rounds.filter(
            (r) =>
                (player.team === 1 && r.team1Win) ||
                (player.team === 2 && r.team2Win)
        ).length;

        const tripletas = rounds.filter(
            (r) =>
                r.tripleta &&
                ((player.team === 1 && r.team1Win) ||
                    (player.team === 2 && r.team2Win))
        ).length;

        return {
            id: player.id,
            name: player.name,
            wins,
            tripletas,
            balance: player.total,
        };
    });
}

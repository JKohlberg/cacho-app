import { Player, Round } from '../types/models'

export function applyRoundToPlayers(players: Player[], round: Round): Player[] {
    const payout = round.payout;

    return players.map((player) => {
        const isWinner =
            (round.team1Win && player.team === 1) ||
            (round.team2Win && player.team === 2);
        const isLoser =
            (round.team1Win && player.team === 2) ||
            (round.team2Win && player.team === 1);

        if (isWinner) {
            return { ...player, total: player.total + payout };
        } else if (isLoser) {
            return { ...player, total: player.total - payout };
        } else {
            return player;
        }
    });
}

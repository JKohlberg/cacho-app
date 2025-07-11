import { Player, Round } from '../types/models'

export function applyRoundToPlayers(players: Player[], round: Round): Player[] {
  const payout = round.tripleta ? round.payout * 2 : round.payout

  return players.map(player => {
    const teamWon = (player.team === 1 && round.team1Win) || (player.team === 2 && round.team2Win)
    const delta = teamWon ? payout : -payout
    return {
      ...player,
      total: player.total + delta,
    }
  })
}

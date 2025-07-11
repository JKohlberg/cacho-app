export interface Player {
  id: string
  name: string
  team: 1 | 2
  total: number
}

export interface Round {
  id: string
  team1Win: boolean
  team2Win: boolean
  payout: number
  tripleta: boolean
  timestamp: number
}

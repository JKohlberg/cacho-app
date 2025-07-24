import { db } from "./firebase";
import {
    collection,
    addDoc,
    Timestamp,
    setDoc,
    getDocs,
    getDoc,
    doc,
} from "firebase/firestore";
import { Player, Round } from "../types/models";

export async function saveSessionToFirestore(
    players: Player[],
    rounds: Round[]
) {
    const session = {
        createdAt: Timestamp.now(),
        players,
        rounds,
    };

    await addDoc(collection(db, "sessions"), session);
}

function normalizeName(name: string): string {
    return name.trim().toLowerCase();
}

export async function loadLeaderboardFromFirestore(): Promise<
  { id: string; name: string; lifetimeWins: number; lifetimeTripletas: number; lifetimeBalance: number }[]
> {
  const snapshot = await getDocs(collection(db, "players"));
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      lifetimeWins: data.lifetimeWins ?? 0,
      lifetimeTripletas: data.lifetimeTripletas ?? 0,
      lifetimeBalance: data.lifetimeBalance ?? 0,
    };
  });
}

export async function updateLeaderboard(players: Player[], rounds: Round[], sessionId: string) {
  for (const player of players) {
    const playerRef = doc(db, 'players', normalizeName(player.name))
    const snapshot = await getDoc(playerRef)

    const existing = snapshot.exists() ? snapshot.data() : {
      lifetimeWins: 0,
      lifetimeTripletas: 0,
      lifetimeBalance: 0,
      sessions: [],
    }

    // Prevent double count
    if (existing.sessions?.includes(sessionId)) {
      console.log(`${player.name} already counted for session ${sessionId}`)
      continue
    }

    let lifetimeWins = 0
    let lifetimeTripletas = 0

    for (const r of rounds) {
      const teamWin = player.team === 1 ? r.team1Win : r.team2Win
      if (teamWin) {
        lifetimeWins++
        if (r.tripleta) lifetimeTripletas++
      }
    }

    const newBalance = player.total

    await setDoc(playerRef, {
      ...existing,
      name: player.name,
      normalizedName: normalizeName(player.name),
      lifetimeWins: existing.lifetimeWins + lifetimeWins,
      lifetimeTripletas: existing.lifetimeTripletas + lifetimeTripletas,
      lifetimeBalance: existing.lifetimeBalance + newBalance,
      sessions: [...(existing.sessions || []), sessionId],
    })
  }
}

export async function loadKnownPlayers(): Promise<
    { name: string; normalizedName: string; id: string }[]
> {
    const snapshot = await getDocs(collection(db, "players"));
    return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            id: doc.id,
            name: data.name,
            normalizedName: data.normalizedName,
        };
    });
}

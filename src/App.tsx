import { useEffect, useState } from "react";
import { saveToLocalStorage, loadFromLocalStorage } from "./utils/localStorage";
import {
    Box,
    Button,
    Checkbox,
    Container,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    TextField,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    FormControlLabel,
    Autocomplete,
} from "@mui/material";

import { Player, Round } from "./types/models";
import { applyRoundToPlayers } from "./utils/roundLogic";
import { generateLeaderboard } from "./utils/leaderboard";
import {
    loadKnownPlayers,
    saveSessionToFirestore,
    updateLeaderboard,
} from "./services/firebaseService";
import { loadLeaderboardFromFirestore } from "./services/firebaseService";
import background from "./assets/images/background.jpg";
import logo from "./assets/images/logo.png";

function App() {
    const [players, setPlayers] = useState<Player[]>(
        () => loadFromLocalStorage<Player[]>("players") || []
    );

    const [rounds, setRounds] = useState<Round[]>(
        () => loadFromLocalStorage<Round[]>("rounds") || []
    );
    const [leaderboard, setLeaderboard] = useState<
        {
            id: string;
            name: string;
            lifetimeWins: number;
            lifetimeTripletas: number;
            lifetimeBalance: number;
        }[]
    >([]);

    const [winner, setWinner] = useState<"1" | "2" | "draw">();
    const [amount, setAmount] = useState<number | undefined>();
    const [tripletas, setTripletas] = useState<number>(0);
    const [newPlayerName, setNewPlayerName] = useState("");
    const [newPlayerTeam, setNewPlayerTeam] = useState<1 | 2>(1);
    const [knownPlayers, setKnownPlayers] = useState<
        { id: string; name: string; normalizedName: string }[]
    >([]);
    const normalizeName = (name: string) => name.trim().toLowerCase();

    const handleAddPlayer = () => {
        const normalized = normalizeName(newPlayerName);

        const existing = knownPlayers.find(
            (p) => p.normalizedName === normalized
        );

        const newPlayer: Player = existing
            ? {
                  id: existing.id,
                  name: existing.name,
                  team: newPlayerTeam,
                  total: 0,
              }
            : {
                  id: crypto.randomUUID(),
                  name: newPlayerName.trim(),
                  team: newPlayerTeam,
                  total: 0,
              };

        setPlayers([...players, newPlayer]);
        setNewPlayerName("");
        setNewPlayerTeam(1);
    };

    const handleAddRound = () => {
        const isDraw = winner === "draw";

        const newRound: Round = {
            id: crypto.randomUUID(),
            team1Win: !isDraw && winner === "1",
            team2Win: !isDraw && winner === "2",
            payout: isDraw ? 0 : amount ?? 0,
            tripleta: tripletas,
            timestamp: Date.now(),
        };

        const updatedPlayers = isDraw
            ? players
            : applyRoundToPlayers(players, newRound);

        setRounds([...rounds, newRound]);
        setPlayers(updatedPlayers);
    };

    useEffect(() => {
        if (winner === "draw") {
            setTripletas(0);
        }
    }, [winner]);

    useEffect(() => {
        saveToLocalStorage("players", players);
    }, [players]);

    useEffect(() => {
        saveToLocalStorage("rounds", rounds);
    }, [rounds]);

    useEffect(() => {
        loadKnownPlayers().then(setKnownPlayers);
        loadLeaderboardFromFirestore().then(setLeaderboard);
    }, []);

    const team1 = players.filter((p) => p.team === 1);
    const team2 = players.filter((p) => p.team === 2);

    const canAddRound =
        winner === "draw" ||
        (winner && typeof amount === "number" && !isNaN(amount) && amount > 0);

    const handleRemovePlayer = (id: string) => {
        const confirm = window.confirm(
            "Are you sure you want to remove this player?"
        );
        if (confirm) {
            setPlayers(players.filter((p) => p.id !== id));
        }
    };

    const handleDeleteLastRound = () => {
        const confirmed = window.confirm("Delete the last round?");
        if (!confirmed) return;

        const updatedRounds = rounds.slice(0, -1);

        // Reset all player totals
        const resetPlayers = players.map((p) => ({ ...p, total: 0 }));

        // Recalculate totals based on remaining rounds
        const recalculatedPlayers = updatedRounds.reduce(
            (currentPlayers, round) =>
                applyRoundToPlayers(currentPlayers, round),
            resetPlayers
        );

        setRounds(updatedRounds);
        setPlayers(recalculatedPlayers);
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh",
                backgroundImage: `url(${background})`,
                backgroundSize: "cover",
                backgroundRepeat: "repeat",
                backgroundPosition: "center",
                px: 2,
                py: 4,
            }}
        >
            <Box
                component="img"
                src={logo}
                alt="Noches de Cacho Logo"
                sx={{
                    maxWidth: 300,
                    alignSelf: "center",
                    mb: 2,
                    mt: 35,
                }}
            />

            <Box
                sx={{
                    width: "100%",
                    maxWidth: 375, // You can set to 375 for iPhone size
                    backgroundColor: "rgba(255, 255, 255, 0.5)",
                    borderRadius: 8,
                    boxShadow: 3,
                    p: 2,
                }}
            >

                <Box mb={4}>
                    <Typography variant="h6" gutterBottom>
                        Add Player
                    </Typography>
                    <Box
                        display="flex"
                        alignItems="center"
                        flexWrap="wrap"
                        gap={2}
                    >
                        <Autocomplete
                            freeSolo
                            options={knownPlayers.map((p) => p.name)}
                            inputValue={newPlayerName}
                            onInputChange={(_, value) =>
                                setNewPlayerName(value)
                            }
                            renderInput={(params) => (
                                <TextField {...params} label="Name" />
                            )}
                            sx={{ width: 200 }}
                        />

                        <FormControl sx={{ minWidth: 120 }}>
                            <InputLabel>Team</InputLabel>
                            <Select
                                value={String(newPlayerTeam)}
                                onChange={(e: SelectChangeEvent) =>
                                    setNewPlayerTeam(
                                        parseInt(e.target.value) as 1 | 2
                                    )
                                }
                                label="Team"
                            >
                                <MenuItem value="1">Team 1</MenuItem>
                                <MenuItem value="2">Team 2</MenuItem>
                            </Select>
                        </FormControl>

                        <Button
                            variant="contained"
                            onClick={handleAddPlayer}
                            disabled={!newPlayerName.trim()}
                        >
                            Add Player
                        </Button>
                    </Box>
                </Box>

                <Box display="flex" justifyContent="space-between" mb={4}>
                    <Box width="48%">
                        <Typography variant="h6">Team 1</Typography>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            {team1.length === 0 ? (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    No players
                                </Typography>
                            ) : (
                                team1.map((p) => (
                                    <Box
                                        key={p.id}
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="space-between"
                                    >
                                        <Typography>
                                            {p.name}: {p.total} Bs
                                        </Typography>
                                        <Button
                                            size="small"
                                            color="error"
                                            onClick={() =>
                                                handleRemovePlayer(p.id)
                                            }
                                        >
                                            ✕
                                        </Button>
                                    </Box>
                                ))
                            )}
                        </Paper>
                    </Box>

                    <Box width="48%">
                        <Typography variant="h6">Team 2</Typography>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            {team2.length === 0 ? (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    No players
                                </Typography>
                            ) : (
                                team2.map((p) => (
                                    <Box
                                        key={p.id}
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="space-between"
                                    >
                                        <Typography>
                                            {p.name}: {p.total} Bs
                                        </Typography>
                                        <Button
                                            size="small"
                                            color="error"
                                            onClick={() =>
                                                handleRemovePlayer(p.id)
                                            }
                                        >
                                            ✕
                                        </Button>
                                    </Box>
                                ))
                            )}
                        </Paper>
                    </Box>
                </Box>

                <Box mb={4}>
                    <Typography variant="h6" gutterBottom>
                        Add Round
                    </Typography>
                    <Box
                        display="flex"
                        alignItems="center"
                        flexWrap="wrap"
                        gap={2}
                    >
                        <FormControl sx={{ minWidth: 120 }}>
                            <InputLabel>Winner</InputLabel>
                            <Select
                                value={winner}
                                onChange={(e: SelectChangeEvent) =>
                                    setWinner(
                                        e.target.value as "1" | "2" | "draw"
                                    )
                                }
                                label="Winner"
                            >
                                <MenuItem value="1">Team 1</MenuItem>
                                <MenuItem value="2">Team 2</MenuItem>
                                <MenuItem value="draw">Draw</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label="Amount"
                            type="number"
                            value={winner === "draw" ? 0 : amount ?? ""}
                            onChange={(e) => {
                                const value = e.target.value;
                                setAmount(value === "" ? undefined : +value);
                            }}
                            disabled={winner === "draw"}
                        />

                        <FormControl sx={{ minWidth: 120 }}>
                            <InputLabel>Tripletas</InputLabel>
                            <Select
                                value={tripletas}
                                onChange={(e) =>
                                    setTripletas(Number(e.target.value))
                                }
                                label="Tripletas"
                                disabled={winner === "draw"}
                            >
                                {[0, 1, 2, 3, 4, 5].map((val) => (
                                    <MenuItem key={val} value={val}>
                                        {val}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Button
                            variant="contained"
                            onClick={handleAddRound}
                            disabled={!canAddRound}
                        >
                            Add
                        </Button>
                    </Box>
                </Box>

                <Box>
                    <Typography variant="h6" gutterBottom>
                        Rounds
                    </Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>#</TableCell>
                                    <TableCell>Winner</TableCell>
                                    <TableCell>Tripleta</TableCell>
                                    <TableCell>Payout</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rounds.map((r, i) => {
                                    const payout = r.tripleta
                                        ? r.payout * 2
                                        : r.payout;
                                    return (
                                        <TableRow key={r.id}>
                                            <TableCell>{i + 1}</TableCell>
                                            <TableCell>
                                                {r.team1Win
                                                    ? "Team 1"
                                                    : r.team2Win
                                                    ? "Team 2"
                                                    : "Draw"}
                                            </TableCell>
                                            <TableCell>{r.tripleta}</TableCell>
                                            <TableCell>{r.payout} Bs</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                <Box display="flex" justifyContent="flex-end" mt={2}>
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={handleDeleteLastRound}
                        disabled={rounds.length === 0}
                    >
                        Delete Last Round
                    </Button>
                </Box>

                <Box mt={6}>
                    <Typography variant="h6" gutterBottom>
                        Leaderboard
                    </Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Player</TableCell>
                                    <TableCell>Wins</TableCell>
                                    <TableCell>Tripletas</TableCell>
                                    <TableCell>Balance (Bs)</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {leaderboard.map((stat) => (
                                    <TableRow key={stat.id}>
                                        <TableCell>{stat.name}</TableCell>
                                        <TableCell>
                                            {stat.lifetimeWins}
                                        </TableCell>
                                        <TableCell>
                                            {stat.lifetimeTripletas}
                                        </TableCell>
                                        <TableCell>
                                            {stat.lifetimeBalance}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
                <Box display="flex" justifyContent="center" mt={4} mb={2}>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={async () => {
                            const sessionId = crypto.randomUUID();
                            await saveSessionToFirestore(players, rounds); // optionally pass sessionId too
                            await updateLeaderboard(players, rounds, sessionId);

                            setPlayers([]);
                            setRounds([]);
                            setWinner(undefined);
                            setAmount(undefined);
                            setTripletas(0);
                            saveToLocalStorage("players", []);
                            saveToLocalStorage("rounds", []);

                            alert("Session saved and cleared!");
                        }}
                    >
                        Finish Session
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}

export default App;

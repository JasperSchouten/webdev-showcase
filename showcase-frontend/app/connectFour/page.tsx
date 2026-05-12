'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Window } from '@/components/Window';
import { getConnection } from '@/services/signalr';
import Image from 'next/image';
import * as signalR from '@microsoft/signalr';
import { handleHubError } from "@/services/hubErrorHandler";

export default function ConnectFour() {
    const router = useRouter();

    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

    const [connected, setConnected] = useState(false);
    const [gameCode, setGameCode] = useState<string | null>(null);
    const [joinCode, setJoinCode] = useState('');

    // 1. Start SignalR
    useEffect(() => {
        let cancelled = false;

        async function start() {
            const token = localStorage.getItem("token");

            if (!token) {
                router.push("/login?message=You need to log in to play Connect Four");
                return;
            }

            try {
                const conn = getConnection();

                if (conn.state === signalR.HubConnectionState.Disconnected) {
                    await conn.start();
                }

                conn.onreconnected(() => {
                    console.log("Reconnected");
                    setConnected(true);
                });

                conn.onclose(() => {
                    console.log("Disconnected");
                    setConnected(false);
                });

                if (!cancelled) {
                    setConnection(conn);
                    setConnected(true);
                    console.log("Connected!");
                }
            } catch (err) {
                console.error(err);
                router.push("/login?message=Your session expired. Please log in again");

            }
        }

        start();

        return () => {
            cancelled = true;
        };
    }, []);

    // 2. Listen to server events
    useEffect(() => {
        if (!connection) return;
        const onGameCreated = (code: string) => {
            console.log('Game created:', code);
            setGameCode(code);
        };

        const onPlayerJoined = (data: any) => {
            console.log('Player joined:', data);
        };

        const onGameUpdated = (game: any) => {
            console.log('Game updated:', game);

            // game starts once both players exist
            if (game.player1Id && game.player2Id) {
                router.push(`/connectFour/play?code=${game.gameCode}`);
            }
        };

        connection.on('GameCreated', onGameCreated);
        connection.on('PlayerJoined', onPlayerJoined);
        connection.on('GameUpdated', onGameUpdated);

        return () => {
            connection.off('GameCreated', onGameCreated);
            connection.off('PlayerJoined', onPlayerJoined);
            connection.off('GameUpdated', onGameUpdated);
        };
    }, [connection, gameCode, joinCode, router]);

    // async handlers that surface server errors
    const handleCreateGame = async () => {
        if (!connection) return;
        try {
            await connection.invoke("CreateGame");
        } catch (err) {
            handleHubError(err);
        }
    };

    const handleJoinGame = async () => {
        if (!connection) return;
        try {
            await connection.invoke("JoinGame", joinCode);
        } catch (err) {
            handleHubError(err);
        }
    };

    return (
        <main className="min-h-screen bg-[#008080] p-4 pb-24">
            <div className="mx-auto max-w-md">
                <Window title="Connect_Four.exe">

                    <div className="border-2 border-black bg-white p-2 shadow-win95-inset mb-4">
                        <Image
                            src="/ConnectFour.png"
                            alt="game preview"
                            width={686}
                            height={386}
                            className="object-cover"
                            priority
                        />
                    </div>

                    <p className="mb-2">
                        Status: {connected ? 'Connected' : 'Connecting...'}
                    </p>

                    {/* CREATE GAME */}
                    <div className="flex flex-row items-center justify-between mb-4">
                        <button
                            className="win95-button"
                            disabled={!connected}
                            onClick={handleCreateGame}
                        >
                            Create Game
                        </button>

                        <span>
                            Code: <strong>{gameCode ?? '-'}</strong>
                        </span>
                    </div>

                    {/* JOIN GAME */}
                    <div className="flex flex-col gap-2">
                        <input
                            className="border p-1"
                            placeholder="Enter game code"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        />

                        <button
                            className="win95-button"
                            disabled={!connected || joinCode.length < 4}
                            onClick={handleJoinGame}
                        >
                            Join Game
                        </button>
                    </div>

                </Window>
            </div>
        </main>
    );
}
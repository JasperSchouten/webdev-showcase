'use client';

import { useEffect, useState } from 'react';
import { Window } from '@/components/Window';
import { getConnection } from '@/services/signalr';
import * as signalR from '@microsoft/signalr';
import { handleHubError } from "@/services/hubErrorHandler";
import { useRouter, useSearchParams } from 'next/navigation';


type Game = {
    gameCode: string;
    board: number[][]; // rows x cols (6 x 7)
    currentTurn: number;
    isFinished: boolean;
    winner?: number | null;
    player1Name: string;
    player2Name: string;

};

export default function PlayPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const gameCode = searchParams.get('code');

    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
    const [game, setGame] = useState<Game | null>(null);
    const [ready, setReady] = useState(false);


    const [hoverColumn, setHoverColumn] = useState<number | null>(null);

    // 1. connect
    useEffect(() => {
        const conn = getConnection();

        async function start() {
            const token = localStorage.getItem("token");

            if (!token) {
                router.push("/login?message=You need to log in to play Connect Four");
                return;
            }

            try {
                if (conn.state === signalR.HubConnectionState.Disconnected) {
                    await conn.start();
                }

                setConnection(conn);

                if (gameCode) {
                    await conn.invoke("JoinGame", gameCode);
                }
            } catch (err) {
                console.error(err);

                router.push("/login?message=Your session expired. Please log in again");
            }
        }

        start();
    }, [gameCode]);

    // 2. listen to updates
    useEffect(() => {
        if (!connection) return;

        const onGameUpdated = (updatedGame: Game) => {
           
            console.log('Game updated:', updatedGame);
            setGame(updatedGame);
            setReady(true);
        };

        connection.on('GameUpdated', onGameUpdated);

        return () => {
            connection.off('GameUpdated', onGameUpdated);
        };
    }, [connection]);

    // 3. send move
    const playMove = async (column: number) => {
        if (!connection || !gameCode) return;

        try {
            await connection.invoke("PlayMove", gameCode, column);
        } catch (err) {
            handleHubError(err);
        }
    };

    // map player 1 -> blue, player 2 -> red
    const cellColor = (value: number | undefined | null) => {
        if (!value) return 'bg-white'; // empty slot
        return value === 1 ? 'bg-blue-600' : 'bg-red-600';
    };

    // board dims
    const rows = 6;
    const cols = 7;
    const boardWidth = 56 * cols; // px
    const boardHeight = 56 * rows; // px

    return (
        <main className="min-h-screen bg-[#008080] p-4">
            <div className="mx-auto max-w-md">
                <Window title={`Connect 4 - ${gameCode || ''}`}>
                    <div className="flex flex-col items-center gap-4">

                        {/* board + side bars */}
                        <div className="flex items-center gap-3">
                            {/* Left bar */}
                            <div
                                className={`w-6 rounded-sm flex items-center justify-center text-white text-xs font-bold transition-all duration-200
                                    ${game?.isFinished && game?.winner === 1 ? 'bg-blue-600 h-[360px]' : game?.currentTurn === 1 ? 'bg-blue-500/80 h-[320px]' : 'bg-blue-500/30 h-[280px]'}`}
                                style={{ writingMode: 'vertical-rl' }}
                            >
                                {game?.isFinished && game?.winner === 1 ? 'WINNER' : 'BLUE'}
                            </div>

                            {/* Board container */}
                            <div
                                className="relative"
                                style={{
                                    width: `${boardWidth}px`,
                                    height: `${boardHeight}px`
                                }}
                            >
                                {/* blue rectangle with cutouts */}
                                <div
                                    className="absolute inset-0 rounded-md"
                                    style={{ background: '#0b57a4', boxShadow: 'inset 0 6px 0 rgba(255,255,255,0.03)' }}
                                />

                                {/* grid of holes */}
                                <div
                                    className="relative z-10 grid gap-2"
                                    style={{
                                        gridTemplateColumns: `repeat(${cols}, 1fr)`,
                                        gridTemplateRows: `repeat(${rows}, 1fr)`,
                                        height: '100%',
                                        padding: '10px'
                                    }}
                                >
                                    {Array.from({ length: rows }).map((_, r) =>
                                        Array.from({ length: cols }).map((_, c) => {
                                            const cellVal = game?.board?.[r]?.[c] ?? 0;
                                            return (
                                                <div
                                                    key={`${r}-${c}`}
                                                    className="flex items-center justify-center"
                                                >
                                                    <div
                                                        className={`w-10 h-10 rounded-full border-2 border-black flex items-center justify-center overflow-hidden ${cellColor(cellVal)}`}
                                                    >
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                {/* hover / column controls */}
                                <div className="absolute inset-0 z-20 flex">
                                    {Array.from({ length: cols }).map((_, c) => (
                                        <div
                                            key={`col-${c}`}
                                            className="flex-1 h-full cursor-pointer"
                                            onMouseEnter={() => setHoverColumn(c)}
                                            onMouseLeave={() => setHoverColumn(null)}
                                            onClick={() => {
                                                if (!ready) return;
                                                playMove(c);
                                            }}
                                        >
                                            {/* preview circle at top when hovering */}
                                            {ready && hoverColumn === c && !game?.isFinished && (
                                                <div className="flex h-full items-start justify-center pointer-events-none">
                                                    <div
                                                        className={`mt-2 w-10 h-10 rounded-full border-2 border-black ${cellColor(game?.currentTurn)}`}
                                                        style={{ opacity: 0.9 }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* draw overlay */}
                                {game?.isFinished && (game?.winner === null || game?.winner === undefined) && (
                                    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40">
                                        <div className="text-4xl font-extrabold text-white">DRAW!</div>
                                    </div>
                                )}
                            </div>

                            {/* Right bar */}
                            <div
                                className={`w-6 rounded-sm flex items-center justify-center text-white text-xs font-bold transition-all duration-200
                                    ${game?.isFinished && game?.winner === 2 ? 'bg-red-600 h-[360px]' : game?.currentTurn === 2 ? 'bg-red-500/80 h-[320px]' : 'bg-red-500/30 h-[280px]'}`}
                                style={{ writingMode: 'vertical-rl' }}
                            >
                                {game?.isFinished && game?.winner === 2 ? 'WINNER' : 'RED'}
                            </div>
                        </div>

                        {/* status text */}
                        <div className="w-full flex items-center justify-center">
                            {!game ? (
                                <div className="text-sm text-gray-700">Waiting for game...</div>
                            ) : game.isFinished ? (
                                game.winner ? (
                                        <div
                                            className={`text-lg font-bold ${game.winner === 1
                                                    ? 'text-blue-600'
                                                    : 'text-red-600'
                                                }`}
                                        >
                                            {(game.winner === 1
                                                ? game.player1Name
                                                : game.player2Name) + " wins!"}
                                        </div>
                                ) : (
                                    <div className="text-lg font-bold text-gray-800">Draw</div>
                                )
                            ) : (
                                <div className={`text-lg font-semibold ${game.currentTurn === 1 ? 'text-blue-600' : 'text-red-600'}`}>
                                            {game.currentTurn === 1
                                                ? `${game.player1Name}'s turn`
                                                : `${game.player2Name}'s turn`}
                                </div>
                            )}
                        </div>

                    </div>
                </Window>
            </div>
        </main>
    );
}
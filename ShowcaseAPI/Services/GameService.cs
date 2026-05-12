using ShowcaseAPI.Models;
using System;

namespace ShowcaseAPI.Services
{
    public class GameService : IGameService
    {
        //the in memory game store, might have to change this to a concurrentdictionary or whatever
        //its called because signalR multithreaded/concurrent yaknow
        private readonly Dictionary<string, Game> _games = new();

        //singleton used for helper method forcreating game codes!!
        private static readonly Random _random = new();
        public Game CreateGame(string playerId, string username)
        {
            string gameCode;

            do
            {
                gameCode = GenerateGameCode();
            }
            while (_games.ContainsKey(gameCode)); //so if its already in there it generates a new one :)

            var game = new Game
            {
                GameCode = gameCode,
                Player1Id = playerId,
                Player1Name = username,
                CurrentTurn = 1 //currently player 1 is the person that made the game and always starts
            };

            _games[gameCode] = game;

            return game;
        }

        public Game JoinGame(string gameCode, string playerId, string username)
        {
            

            if (!_games.TryGetValue(gameCode, out var game))
            {
                throw new Exception("Game not found.");
            }

            if (game.Player2Id != null && game.Player2Id != playerId)
            {
                throw new Exception("Game is full.");
            }

            game.Player2Id = playerId;
            game.Player2Name = username;

            return game;
        }

        public Game GetGame(string gameCode)
        {
            if (!_games.TryGetValue(gameCode, out var game))
            {
                throw new Exception("Game not found.");
            }

            return game;
        }

        public Game PlayMove(string gameCode, string playerId, int column)
        {
            if (!_games.TryGetValue(gameCode, out var game))
                throw new Exception("Game not found.");

            if (game.IsFinished)
                throw new Exception("Game is already finished.");

            if (column < 0 || column > 6)
                throw new Exception("Invalid column.");

            if (game.CurrentTurn == 1 && game.Player1Id != playerId)
                throw new Exception("Not your turn.");

            if (game.CurrentTurn == 2 && game.Player2Id != playerId)
                throw new Exception("Not your turn.");

            int row = GetAvailableRow(game.Board, column);

            if (row == -1)
                throw new Exception("Column is full.");

            game.Board[row][column] = game.CurrentTurn;

            if (CheckWin(game.Board, row, column, game.CurrentTurn))
            {
                game.IsFinished = true;
                game.Winner = game.CurrentTurn;
                return game;
            }

            if (IsBoardFull(game.Board))
            {
                game.IsFinished = true;
                return game;
            }

            game.CurrentTurn = game.CurrentTurn == 1 ? 2 : 1;

            return game;
        }


        //helper functions

        private string GenerateGameCode()
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

            return new string(
                Enumerable.Repeat(chars, 6)
                    .Select(s => s[_random.Next(s.Length)])
                    .ToArray()
            );
        }

        private int GetAvailableRow(int[][] board, int column)
        {
            for (int row = 5; row >= 0; row--)
            {
                if (board[row][column] == 0)
                    return row;
            }

            return -1;
        }

        private bool IsBoardFull(int[][] board)
        {
            for (int c = 0; c < 7; c++)
            {
                if (board[0][c] == 0)  // [0, c] because u only need to check the top row!
                    return false;
            }

            return true;
        }

        private bool CheckWin(int[][] board, int row, int col, int player)
        {
            return CheckDirection(board, row, col, player, 1, 0)   // vertical
                || CheckDirection(board, row, col, player, 0, 1)   // horizontal
                || CheckDirection(board, row, col, player, 1, 1)   // diagonal \
                || CheckDirection(board, row, col, player, 1, -1); // diagonal /
        }

        private bool CheckDirection(int[][] board, int row, int col, int player, int dRow, int dCol)
        {
            int count = 1;

            count += Count(board, row, col, player, dRow, dCol);
            count += Count(board, row, col, player, -dRow, -dCol);

            return count >= 4;
        }

        private int Count(int[][] board, int row, int col, int player, int dRow, int dCol)
        {
            int count = 0;

            int r = row + dRow;
            int c = col + dCol;

            while (r >= 0 && r < 6 && c >= 0 && c < 7 && board[r][c] == player)
            {
                count++;
                r += dRow;
                c += dCol;
            }

            return count;
        }
    }
}

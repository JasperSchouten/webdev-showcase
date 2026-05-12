//csharp tests/ShowcaseAPI.Tests/GameServiceTests.cs
using System;
using System.Linq;
using FluentAssertions;
using ShowcaseAPI.Services;
using Xunit;

namespace ShowcaseAPI.Tests
{
    public class GameServiceTests
    {
        private GameService CreateService() => new GameService();

        [Fact]
        public void CreateGame_HappyPath_SetsPlayer1AndBoard()
        {
            var svc = CreateService();

            var game = svc.CreateGame("p1", "Alice");

            game.Should().NotBeNull();
            game.GameCode.Should().NotBeNullOrWhiteSpace();
            game.Player1Id.Should().Be("p1");
            game.Player1Name.Should().Be("Alice");
            game.CurrentTurn.Should().Be(1);
            game.Board.Should().HaveCount(6);
            foreach (var row in game.Board) row.Should().HaveCount(7);
            // board initialized to zeros
            game.Board.SelectMany(r => r).All(v => v == 0).Should().BeTrue();
        }

        [Fact]
        public void CreateGame_MultipleCalls_GeneratesDifferentGameCodes()
        {
            var svc = CreateService();
            var codes = Enumerable.Range(0, 100).Select(i => svc.CreateGame($"p{i}", $"u{i}").GameCode).ToList();
            codes.Distinct().Count().Should().Be(codes.Count);
        }

        [Fact]
        public void GetGame_NotFound_Throws()
        {
            var svc = CreateService();
            Action act = () => svc.GetGame("NOPE");
            act.Should().Throw<Exception>().WithMessage("Game not found.");
        }

        [Fact]
        public void JoinGame_HappyPath_SetsPlayer2()
        {
            var svc = CreateService();
            var g = svc.CreateGame("p1", "Alice");

            var updated = svc.JoinGame(g.GameCode, "p2", "Bob");

            updated.Player2Id.Should().Be("p2");
            updated.Player2Name.Should().Be("Bob");
        }

        [Fact]
        public void JoinGame_RejoinAsSamePlayer_Idempotent()
        {
            var svc = CreateService();
            var g = svc.CreateGame("p1", "Alice");

            // first join as player2
            svc.JoinGame(g.GameCode, "p2", "Bob");

            // same player2 tries to join again -> should be fine (no exception)
            Action act = () => svc.JoinGame(g.GameCode, "p2", "Bob");
            act.Should().NotThrow();
        }

        [Fact]
        public void JoinGame_GameFull_ThrowsForThirdPlayer()
        {
            var svc = CreateService();
            var g = svc.CreateGame("p1", "Alice");

            svc.JoinGame(g.GameCode, "p2", "Bob");

            Action act = () => svc.JoinGame(g.GameCode, "p3", "Charlie");
            act.Should().Throw<Exception>().WithMessage("Game is full.");
        }

        [Fact]
        public void PlayMove_LegalMove_PlacesDiskAndTogglesTurn()
        {
            var svc = CreateService();
            var g = svc.CreateGame("p1", "Alice");
            svc.JoinGame(g.GameCode, "p2", "Bob");

            var after = svc.PlayMove(g.GameCode, "p1", 3);

            // bottom row should be occupied at column 3
            after.Board[5][3].Should().Be(1);
            after.CurrentTurn.Should().Be(2);
        }

        [Fact]
        public void PlayMove_InvalidColumn_Throws()
        {
            var svc = CreateService();
            var g = svc.CreateGame("p1", "Alice");

            Action act = () => svc.PlayMove(g.GameCode, "p1", -1);
            act.Should().Throw<Exception>().WithMessage("Invalid column.");

            act = () => svc.PlayMove(g.GameCode, "p1", 7);
            act.Should().Throw<Exception>().WithMessage("Invalid column.");
        }

        [Fact]
        public void PlayMove_NotYourTurn_Throws()
        {
            var svc = CreateService();
            var g = svc.CreateGame("p1", "Alice");
            svc.JoinGame(g.GameCode, "p2", "Bob");

            // it's player1's turn, player2 tries to play
            Action act = () => svc.PlayMove(g.GameCode, "p2", 0);
            act.Should().Throw<Exception>().WithMessage("Not your turn.");
        }

        [Fact]
        public void PlayMove_ColumnFull_Throws()
        {
            var svc = CreateService();
            var g = svc.CreateGame("p1", "Alice");
            svc.JoinGame(g.GameCode, "p2", "Bob");

            // fill column 0
            for (int r = 5; r >= 0; r--)
            {
                // alternate players to satisfy turn checks
                var player = (g.CurrentTurn == 1) ? g.Player1Id : g.Player2Id;
                svc.PlayMove(g.GameCode, player, 0);
            }

            // now column is full
            Action act = () => svc.PlayMove(g.GameCode, g.Player1Id, 0);
            act.Should().Throw<Exception>().WithMessage("Column is full.");
        }

        [Fact]
        public void PlayMove_VerticalWin_SetsWinnerAndFinished()
        {
            var svc = CreateService();
            var g = svc.CreateGame("p1", "Alice");
            svc.JoinGame(g.GameCode, "p2", "Bob");

            // prepare 3 vertical pieces for player1 in column 0 at rows 5,4,3
            g.Board[5][0] = 1;
            g.Board[4][0] = 1;
            g.Board[3][0] = 1;

            // ensure it's player1's turn and call PlayMove for player1 on column 0
            g.CurrentTurn = 1;

            var after = svc.PlayMove(g.GameCode, g.Player1Id, 0);

            after.IsFinished.Should().BeTrue();
            after.Winner.Should().Be(1);
        }

        [Fact]
        public void PlayMove_NoWin_DoesNotSetFinished()
        {
            var svc = CreateService();
            var g = svc.CreateGame("p1", "Alice");
            svc.JoinGame(g.GameCode, "p2", "Bob");

            // single move that doesn't win
            var after = svc.PlayMove(g.GameCode, g.Player1Id, 2);

            after.IsFinished.Should().BeFalse();
            after.Winner.Should().BeNull();
        }

        [Fact]
        public void PlayMove_Draw_SetsFinished_NoWinner()
        {
            var svc = CreateService();
            var g = svc.CreateGame("p1", "Alice");
            svc.JoinGame(g.GameCode, "p2", "Bob");

            // fill board with alternating pattern to avoid any connect-4
            for (int r = 0; r < 6; r++)
            {
                for (int c = 0; c < 7; c++)
                {
                    g.Board[r][c] = ((r + c) % 2) + 1;
                }
            }

            // make top cell of column 3 empty so last move will fill it
            g.Board[0][3] = 0;

            // ensure rows 5..1 of col 3 are filled so available row will be 0
            for (int r = 5; r >= 1; r--)
            {
                g.Board[r][3] = ((r + 3) % 2) + 1;
            }

            // Make sure it's player1's turn
            g.CurrentTurn = 1;

            var after = svc.PlayMove(g.GameCode, g.Player1Id, 3);

            after.IsFinished.Should().BeTrue();
            after.Winner.Should().BeNull();
        }
    }
}
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using ShowcaseAPI.Models;
using ShowcaseAPI.Services;
using System.Security.Claims;

namespace ShowcaseAPI.Hubs
{
    [Authorize(Roles = "User")]
    public class GameHub : Hub
    {
        private readonly IGameService _gameService;

        public GameHub(IGameService gameService)
        {
            _gameService = gameService;
        }

        private string GetPlayerId()
        {
            return Context.User?
                .FindFirst(ClaimTypes.NameIdentifier)?
                .Value
                ?? throw new HubException("Unauthorized user");
        }

        private string GetUsername()
        {
            return Context.User?
                .FindFirst(ClaimTypes.Name)?
                .Value
                ?? throw new HubException("Unauthorized user");
        }

        public async Task CreateGame()
        {
            try
            {
                var playerId = GetPlayerId();
                var username = GetUsername();

                var game = _gameService.CreateGame(playerId, username);

                await Groups.AddToGroupAsync(Context.ConnectionId, game.GameCode);

                await Clients.Caller.SendAsync("GameCreated", game.GameCode);
            }
            catch (Exception ex)
            {
                throw new HubException(ex.Message);
            }
        }

        public async Task JoinGame(string gameCode)
        {
            try
            {
                var playerId = GetPlayerId();
                var username = GetUsername();

                // Try to get the game first.
                var game = _gameService.GetGame(gameCode);

                // Safe rejoin for the creator: if caller is already Player1 just add them back to the group
                if (game.Player1Id == playerId)
                {
                    await Groups.AddToGroupAsync(Context.ConnectionId, gameCode);

                    // Send the full game state so the client can render immediately
                    await Clients.Caller.SendAsync("GameUpdated", game);
                    return;
                }

                // If player is already Player2, also allow rejoin
                if (game.Player2Id != null && game.Player2Id == playerId)
                {
                    await Groups.AddToGroupAsync(Context.ConnectionId, gameCode);
                    await Clients.Caller.SendAsync("GameUpdated", game);
                    return;
                }

                // Otherwise attempt to join as the second player
                var updated = _gameService.JoinGame(gameCode, playerId, username);

                await Groups.AddToGroupAsync(Context.ConnectionId, gameCode);

                // notify group that a player joined and provide the full game state
                await Clients.Group(gameCode)
                    .SendAsync("PlayerJoined", new
                    {
                        updated.Player1Id,
                        updated.Player2Id,
                        updated.GameCode
                    });

                await Clients.Group(gameCode)
                    .SendAsync("GameUpdated", updated);
            }
            catch (Exception ex)
            {
                throw new HubException(ex.Message);
            }
        }

        public async Task PlayMove(string gameCode, int column)
        {
            try
            {
                var playerId = GetPlayerId();

                var game = _gameService.PlayMove(gameCode, playerId, column);

                await Clients.Group(gameCode)
                    .SendAsync("GameUpdated", game);
            }
            catch (Exception ex)
            {
                throw new HubException(ex.Message);
            }
        }
    }
}

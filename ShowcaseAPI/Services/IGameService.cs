using ShowcaseAPI.Models;

namespace ShowcaseAPI.Services
{
    public interface IGameService
    {
        Game CreateGame(string playerId, string username);

        Game JoinGame(string gameCode, string playerId, string username);

        Game PlayMove(string gameCode, string playerId, int column);

        Game GetGame(string gameCode);
    }
}

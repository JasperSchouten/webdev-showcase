namespace ShowcaseAPI.Models
{
    public class Game
    {
        public string GameCode { get; set; }

        public string Player1Id { get; set; }
        public string Player2Id { get; set; }

        public string? Player1Name { get; set; }
        public string? Player2Name { get; set; }

        //has to be a jagged array for javascript to understand
        public int[][] Board { get; set; } =
            Enumerable.Range(0, 6)
                .Select(_ => new int[7])
                .ToArray();

        public int CurrentTurn { get; set; } = 1;

        public bool IsFinished { get; set; }

        public int? Winner { get; set; }
    }
}

namespace MagicStats.Stats.Domain;

public record DataPoint(
    DateOnly Date,
    float? Winrate);
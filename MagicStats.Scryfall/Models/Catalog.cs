using System.Text.Json.Serialization;

#pragma warning disable CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider adding the 'required' modifier or declaring as nullable.

namespace MagicStats.Scryfall.Models;

class Catalog : BaseItem
{
    [JsonPropertyName("uri")]
    public Uri Uri { get; set; }

    [JsonPropertyName("total_values")]
    public int TotalValues { get; set; }

    [JsonPropertyName("data")]
    public string[] Data { get; set; }
}
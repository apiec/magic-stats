using System.Text.Json.Serialization;

namespace MagicStats.Scryfall.Models;

public class Preview
{
    /// <summary>
    /// The date this card was previewed. 
    /// </summary>
    [JsonPropertyName("previewed_at")]
    public DateTime? Date { get; set; }

    /// <summary>
    /// A link to the preview for this card. 
    /// </summary>
    [JsonPropertyName("source_uri")]
    public Uri? SourceUri { get; set; }

    /// <summary>
    /// The name of the source that previewed this card. 
    /// </summary>
    [JsonPropertyName("source")]
    public string? Source { get; set; }
}
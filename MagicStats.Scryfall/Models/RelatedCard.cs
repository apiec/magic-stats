using System.Text.Json.Serialization;

#pragma warning disable CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider adding the 'required' modifier or declaring as nullable.

namespace MagicStats.Scryfall.Models;

public class RelatedCard : BaseItem
{
    /// <summary>
    /// A unique ID for this card in Scryfall’s database. 
    /// </summary>
    [JsonPropertyName("id")]
    public Guid Id { get; set; }

    /// <summary>
    /// A field explaining what role this card plays in this relationship, one of
    /// token, meld_part, meld_result, or combo_piece. 
    /// </summary>
    [JsonPropertyName("component")]
    public string Component { get; set; }

    /// <summary>
    ///  The name of this particular related card. 
    /// </summary>
    [JsonPropertyName("name")]
    public string Name { get; set; }

    /// <summary>
    /// The type line of this card. 
    /// </summary>
    [JsonPropertyName("type_line")]
    public string TypeLine { get; set; }

    /// <summary>
    /// A URI where you can retrieve a full object describing this card on Scryfall’s API. 
    /// </summary>
    [JsonPropertyName("uri")]
    public Uri Uri { get; set; }
}
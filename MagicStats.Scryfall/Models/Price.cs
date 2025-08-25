using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

#pragma warning disable CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider adding the 'required' modifier or declaring as nullable.

namespace MagicStats.Scryfall.Models;

public class Price : BaseItem
{
    [JsonConverter(typeof(UsDecimalAsStringConverter))]
    [JsonPropertyName("eur")]
    public decimal? Eur { get; set; }

    [JsonConverter(typeof(UsDecimalAsStringConverter))]
    [JsonPropertyName("eur_foil")]
    public decimal? EurFoil { get; set; }

    [JsonConverter(typeof(UsDecimalAsStringConverter))]
    [JsonPropertyName("tix")]
    public decimal? Tix { get; set; }

    [JsonConverter(typeof(UsDecimalAsStringConverter))]
    [JsonPropertyName("usd")]
    public decimal? Usd { get; set; }

    [JsonConverter(typeof(UsDecimalAsStringConverter))]
    [JsonPropertyName("usd_etched")]
    public decimal? UsdEtched { get; set; }

    [JsonConverter(typeof(UsDecimalAsStringConverter))]
    [JsonPropertyName("usd_foil")]
    public decimal? UsdFoil { get; set; }
}

/// <summary>
/// Scryfall uses strings to encode their monetary amounts in US format rather than simply using a
/// JSON number. System.Text.Json is very strict on number conversions, so converting a string to
/// a decimal needs some customization.
/// </summary>
internal class UsDecimalAsStringConverter : JsonConverter<decimal?>
{
    private static readonly NumberFormatInfo NumberFormat = CultureInfo.InvariantCulture.NumberFormat;

    public override decimal? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var value = reader.GetString();
        return value is null ? null : decimal.Parse(value, NumberFormat);
    }

    public override void Write(Utf8JsonWriter writer, decimal? value, JsonSerializerOptions options) =>
        writer.WriteStringValue(value?.ToString());
}
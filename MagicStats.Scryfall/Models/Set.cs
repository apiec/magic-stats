﻿using System.Text.Json.Serialization;

#pragma warning disable CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider adding the 'required' modifier or declaring as nullable.

namespace MagicStats.Scryfall.Models;

public class Set : BaseItem
{
    /// <summary>
    /// The block or group name code for this set, if any.
    /// </summary>
    [JsonPropertyName("block")]
    public string Block { get; set; }

    /// <summary>
    /// The block code for this set, if any.
    /// </summary>
    [JsonPropertyName("block_code")]
    public string BlockCode { get; set; }

    /// <summary>
    /// The number of cards in this set.
    /// </summary>
    [JsonPropertyName("card_count")]
    public int CardCount { get; set; }

    /// <summary>
    /// The unique three or four-letter code for this set.
    /// </summary>
    [JsonPropertyName("code")]
    public string Code { get; set; }

    /// <summary>
    /// A URI to an SVG file for this set’s icon on Scryfall’s CDN. Hotlinking this image isn’t
    /// recommended, because it may change slightly over time. You should download it and use it
    /// locally for your particular user interface needs.
    /// </summary>
    [JsonPropertyName("icon_svg_uri")]
    public Uri IconSvgUri { get; set; }

    /// <summary>
    /// True if this set was only released on Magic Online.
    /// </summary>
    [JsonPropertyName("digital")]
    public bool IsDigital { get; set; }

    /// <summary>
    /// True if this set contains only foil cards.
    /// </summary>
    [JsonPropertyName("foil_only")]
    public bool IsFoilOnly { get; set; }

    /// <summary>
    /// The unique code for this set on MTGO, which may differ from the regular code.
    /// </summary>
    [JsonPropertyName("mtgo_code")]
    public string MtgoCode { get; set; }

    /// <summary>
    /// The English name of the set.
    /// </summary>
    [JsonPropertyName("name")]
    public string Name { get; set; }

    /// <summary>
    /// The set code for the parent set, if any. promo and token sets often have a parent set.
    /// </summary>
    [JsonPropertyName("parent_set_code")]
    public string ParentSetCode { get; set; }

    /// <summary>
    /// The date the set was released (in GMT-8 Pacific time). Not all sets have a known release date.
    /// </summary>
    [JsonPropertyName("released_at")]
    public DateTime? ReleaseDate { get; set; }

    /// <summary>
    /// A computer-readable classification for this set. See below.
    /// </summary>
    [JsonPropertyName("set_type")]
    public string SetType { get; set; }

    /// <summary>
    /// A Scryfall API URI that you can request to begin paginating over the cards in this set.
    /// </summary>
    [JsonPropertyName("search_uri")]
    public Uri SsearchUri { get; set; }

    public override string ToString() => $"{Name} ({Code})";
}
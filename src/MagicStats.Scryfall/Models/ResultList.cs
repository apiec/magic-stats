﻿using System.Text.Json.Serialization;

#pragma warning disable CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider adding the 'required' modifier or declaring as nullable.

namespace MagicStats.Scryfall.Models;

public class ResultList<T> : BaseItem where T : BaseItem
{
    /// <summary>
    /// If this is a list of Card objects, this field will contain the total number of cards found
    /// across all pages.
    /// </summary>
    [JsonPropertyName("total_cards")]
    public int TotalCards { get; set; }

    /// <summary>
    /// True if this List is paginated and there is a page beyond the current page.
    /// </summary>
    [JsonPropertyName("has_more")]
    public bool HasMore { get; set; }

    /// <summary>
    /// If there is a page beyond the current page, this field will contain a full API URI to that
    /// page. You may submit a HTTP GET request to that URI to continue paginating forward on this List.
    /// </summary>
    [JsonPropertyName("next_page")]
    public Uri NextPage { get; set; }

    /// <summary>
    /// An array of the requested objects, in a specific order.
    /// </summary>
    [JsonPropertyName("data")]
    public ICollection<T> Data { get; set; }
}
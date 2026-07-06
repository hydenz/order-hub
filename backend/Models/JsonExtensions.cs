using System.Text.Json;

namespace order_hub.Models;

public static class JsonExtensions
{
    private static readonly JsonSerializerOptions Options = new()
    {
        WriteIndented = false,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public static string ToJson(this object? obj)
        => JsonSerializer.Serialize(obj, Options);
}

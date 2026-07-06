using System.ComponentModel.DataAnnotations;

namespace order_hub.Models;

public class AuditLog
{
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string EntityType { get; set; } = string.Empty;

    public int EntityId { get; set; }

    [Required, MaxLength(50)]
    public string Action { get; set; } = string.Empty;

    public string? OldValues { get; set; }
    public string? NewValues { get; set; }

    [MaxLength(200)]
    public string? ChangedBy { get; set; }

    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
}

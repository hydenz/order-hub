using System.ComponentModel.DataAnnotations;

namespace order_hub.Models;

public class DeliverySchedule
{
    public int Id { get; set; }

    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;

    [Required]
    public DateTime ScheduledDate { get; set; }

    public DateTime? ServiceWindowStart { get; set; }
    public DateTime? ServiceWindowEnd { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

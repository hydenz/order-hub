using System.ComponentModel.DataAnnotations;

namespace order_hub.Models;

public enum DeliveryStatus
{
    Scheduled,
    InTransit,
    Delivered
}

public class DeliverySchedule
{
    public int Id { get; set; }

    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public int TransportTypeId { get; set; }
    public TransportType TransportType { get; set; } = null!;

    [Required]
    public DateTime ScheduledDate { get; set; }

    public DeliveryStatus Status { get; set; } = DeliveryStatus.Scheduled;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

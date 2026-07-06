using System.ComponentModel.DataAnnotations;

namespace order_hub.Models;

public class TransportType
{
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<CustomerTransportType> AuthorizedCustomers { get; set; } = new List<CustomerTransportType>();
}

using System.ComponentModel.DataAnnotations;

namespace order_hub.Models;

public enum OrderStatus
{
    Criada,
    Planejada,
    Agendada,
    EmTransporte,
    Entregue
}

public class Order
{
    public int Id { get; set; }

    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;

    public int TransportTypeId { get; set; }
    public TransportType TransportType { get; set; } = null!;

    [Required]
    public OrderStatus Status { get; set; } = OrderStatus.Criada;

    public decimal TotalAmount { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    public DeliverySchedule? DeliverySchedule { get; set; }
}

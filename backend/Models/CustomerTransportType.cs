namespace order_hub.Models;

public class CustomerTransportType
{
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
    public int TransportTypeId { get; set; }
    public TransportType TransportType { get; set; } = null!;
}

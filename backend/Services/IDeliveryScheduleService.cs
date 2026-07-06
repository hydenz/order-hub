using order_hub.Models;

namespace order_hub.Services;

public interface IDeliveryScheduleService
{
    Task<DeliverySchedule?> GetByOrderIdAsync(int orderId);
    Task<DeliverySchedule> CreateOrUpdateAsync(int orderId, DateTime scheduledDate, DateTime? serviceWindowStart, DateTime? serviceWindowEnd);
}

using order_hub.Models;

namespace order_hub.Services;

public interface IDeliveryScheduleService
{
    Task<DeliverySchedule?> GetByOrderIdAsync(int orderId);
    Task<DeliverySchedule> CreateAsync(int orderId, DeliverySchedule schedule);
    Task<DeliverySchedule?> UpdateAsync(int orderId, DeliverySchedule schedule);
}

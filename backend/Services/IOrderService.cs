using order_hub.Models;
using order_hub.Models.DTOs;

namespace order_hub.Services;

public interface IOrderService
{
    Task<List<Order>> GetAllAsync(string? statusFilter, int? customerId, int? transportTypeId, DateTime? startDate, DateTime? endDate);
    Task<Order?> GetByIdAsync(int id);
    Task<Order> CreateAsync(int customerId, int transportTypeId);
    Task<Order?> AddItemAsync(int orderId, AddItemRequest request);
    Task<Order?> RemoveItemAsync(int orderId, int itemId);
    Task<Order?> PlanAsync(int id);
    Task<Order?> ScheduleAsync(int id, DateTime scheduledDate, DateTime? serviceWindowStart, DateTime? serviceWindowEnd);
    Task<Order?> StartTransportAsync(int id);
    Task<Order?> DeliverAsync(int id);
    Task<Order?> CancelAsync(int id);
}

using order_hub.Models;

namespace order_hub.Services;

public record AddItemRequest(int ItemId, int Quantity);

public interface IOrderService
{
    Task<List<Order>> GetAllAsync(string? statusFilter);
    Task<Order?> GetByIdAsync(int id);
    Task<Order> CreateAsync(int customerId);
    Task<Order?> AddItemAsync(int orderId, AddItemRequest request);
    Task<Order?> RemoveItemAsync(int orderId, int itemId);
    Task<Order?> ConfirmAsync(int id);
    Task<Order?> CancelAsync(int id);
    Task<Order?> ShipAsync(int id);
    Task<Order?> DeliverAsync(int id);
}

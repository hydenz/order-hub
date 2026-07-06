using Microsoft.EntityFrameworkCore;
using order_hub.Data;
using order_hub.Models;

namespace order_hub.Services;

public class OrderService : IOrderService
{
    private readonly AppDbContext _db;
    private readonly IAuditService _audit;

    public OrderService(AppDbContext db, IAuditService audit)
    {
        _db = db;
        _audit = audit;
    }

    public async Task<List<Order>> GetAllAsync(string? statusFilter)
    {
        var query = _db.Orders
            .Include(o => o.Customer)
            .Include(o => o.Items).ThenInclude(i => i.Item)
            .AsQueryable();

        if (!string.IsNullOrEmpty(statusFilter) && Enum.TryParse<OrderStatus>(statusFilter, true, out var parsed))
            query = query.Where(o => o.Status == parsed);

        return await query.OrderByDescending(o => o.CreatedAt).ToListAsync();
    }

    public async Task<Order?> GetByIdAsync(int id)
        => await _db.Orders
            .Include(o => o.Customer)
            .Include(o => o.Items).ThenInclude(i => i.Item)
            .Include(o => o.DeliverySchedule).ThenInclude(d => d!.TransportType)
            .FirstOrDefaultAsync(o => o.Id == id);

    public async Task<Order> CreateAsync(int customerId)
    {
        var order = new Order
        {
            CustomerId = customerId,
            Status = OrderStatus.Draft,
            TotalAmount = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Orders.Add(order);
        await _db.SaveChangesAsync();
        return order;
    }

    public async Task<Order?> AddItemAsync(int orderId, AddItemRequest request)
    {
        var order = await _db.Orders
            .Include(o => o.Items).ThenInclude(i => i.Item)
            .FirstOrDefaultAsync(o => o.Id == orderId);

        if (order == null) return null;
        if (order.Status != OrderStatus.Draft) throw new InvalidOperationException("Only draft orders can be modified.");

        var item = await _db.Items.FindAsync(request.ItemId)
            ?? throw new InvalidOperationException("Item not found.");

        var existing = order.Items.FirstOrDefault(i => i.ItemId == request.ItemId);
        if (existing != null)
        {
            existing.Quantity += request.Quantity;
        }
        else
        {
            order.Items.Add(new OrderItem
            {
                ItemId = request.ItemId,
                Quantity = request.Quantity,
                UnitPrice = item.Price
            });
        }

        RecalculateTotal(order);
        order.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return order;
    }

    public async Task<Order?> RemoveItemAsync(int orderId, int itemId)
    {
        var order = await _db.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == orderId);

        if (order == null) return null;
        if (order.Status != OrderStatus.Draft) throw new InvalidOperationException("Only draft orders can be modified.");

        var oi = order.Items.FirstOrDefault(i => i.ItemId == itemId);
        if (oi == null) return null;

        _db.OrderItems.Remove(oi);
        RecalculateTotal(order);
        order.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return order;
    }

    public async Task<Order?> ConfirmAsync(int id)
    {
        var order = await _db.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return null;
        if (order.Status != OrderStatus.Draft) throw new InvalidOperationException("Only draft orders can be confirmed.");
        if (order.Items.Count == 0) throw new InvalidOperationException("Cannot confirm an order without items.");

        var oldStatus = order.Status;
        order.Status = OrderStatus.Confirmed;
        order.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Order", id, "Confirmed", new { Status = oldStatus.ToString() }, new { Status = OrderStatus.Confirmed.ToString() });
        return order;
    }

    public async Task<Order?> CancelAsync(int id)
    {
        var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return null;
        if (order.Status == OrderStatus.Delivered || order.Status == OrderStatus.Cancelled)
            throw new InvalidOperationException("Order cannot be cancelled.");

        var oldStatus = order.Status;
        order.Status = OrderStatus.Cancelled;
        order.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Order", id, "Cancelled", new { Status = oldStatus.ToString() }, new { Status = OrderStatus.Cancelled.ToString() });
        return order;
    }

    public async Task<Order?> ShipAsync(int id)
    {
        var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return null;
        if (order.Status != OrderStatus.Confirmed) throw new InvalidOperationException("Only confirmed orders can be shipped.");

        order.Status = OrderStatus.Shipped;
        order.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Order", id, "Shipped", null, new { Status = OrderStatus.Shipped.ToString() });
        return order;
    }

    public async Task<Order?> DeliverAsync(int id)
    {
        var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return null;
        if (order.Status != OrderStatus.Shipped) throw new InvalidOperationException("Only shipped orders can be delivered.");

        order.Status = OrderStatus.Delivered;
        order.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Order", id, "Delivered", null, new { Status = OrderStatus.Delivered.ToString() });
        return order;
    }

    private void RecalculateTotal(Order order)
        => order.TotalAmount = order.Items.Sum(i => i.Quantity * i.UnitPrice);
}

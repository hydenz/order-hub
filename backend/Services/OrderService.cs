using Microsoft.EntityFrameworkCore;
using order_hub.Data;
using order_hub.Models;
using order_hub.Models.DTOs;

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

    public async Task<List<Order>> GetAllAsync(string? statusFilter, int? customerId, int? transportTypeId, DateTime? startDate, DateTime? endDate)
    {
        var query = _db.Orders
            .Include(o => o.Customer)
            .Include(o => o.TransportType)
            .Include(o => o.Items).ThenInclude(i => i.Item)
            .AsQueryable();

        if (!string.IsNullOrEmpty(statusFilter) && Enum.TryParse<OrderStatus>(statusFilter, true, out var parsed))
            query = query.Where(o => o.Status == parsed);

        if (customerId.HasValue)
            query = query.Where(o => o.CustomerId == customerId.Value);

        if (transportTypeId.HasValue)
            query = query.Where(o => o.TransportTypeId == transportTypeId.Value);

        if (startDate.HasValue)
            query = query.Where(o => o.CreatedAt >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(o => o.CreatedAt <= endDate.Value);

        return await query.OrderByDescending(o => o.CreatedAt).ToListAsync();
    }

    public async Task<Order?> GetByIdAsync(int id)
        => await _db.Orders
            .Include(o => o.Customer)
            .Include(o => o.TransportType)
            .Include(o => o.Items).ThenInclude(i => i.Item)
            .Include(o => o.DeliverySchedule)
            .FirstOrDefaultAsync(o => o.Id == id);

    public async Task<Order> CreateAsync(int customerId, int transportTypeId, List<OrderItemRequest>? items = null)
    {
        var customer = await _db.Customers
            .Include(c => c.AuthorizedTransportTypes)
            .FirstOrDefaultAsync(c => c.Id == customerId)
            ?? throw new InvalidOperationException("Cliente não encontrado.");

        var transportType = await _db.TransportTypes.FindAsync(transportTypeId)
            ?? throw new InvalidOperationException("Tipo de transporte não encontrado.");

        if (!customer.AuthorizedTransportTypes.Any(ct => ct.TransportTypeId == transportTypeId))
            throw new InvalidOperationException("O cliente não possui autorização para este tipo de transporte.");

        var order = new Order
        {
            CustomerId = customerId,
            TransportTypeId = transportTypeId,
            Status = OrderStatus.Criada,
            TotalAmount = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        if (items != null && items.Count != 0)
        {
            var itemIds = items.Select(i => i.ItemId).ToList();
            var existingItems = await _db.Items.Where(i => itemIds.Contains(i.Id)).ToDictionaryAsync(i => i.Id);

            foreach (var item in items)
            {
                if (!existingItems.TryGetValue(item.ItemId, out var existing))
                    throw new InvalidOperationException($"Item com ID {item.ItemId} não encontrado.");

                order.Items.Add(new OrderItem
                {
                    ItemId = item.ItemId,
                    Quantity = item.Quantity,
                    UnitPrice = existing.Price
                });
            }

            order.TotalAmount = order.Items.Sum(i => i.Quantity * i.UnitPrice);
        }

        _db.Orders.Add(order);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Order", order.Id, "Criada", null, new { Status = OrderStatus.Criada.ToString(), TransportTypeId = transportTypeId, ItemsCount = items?.Count ?? 0 }, "system");
        return order;
    }

    public async Task<Order?> AddItemAsync(int orderId, AddItemRequest request)
    {
        var order = await _db.Orders
            .Include(o => o.Items).ThenInclude(i => i.Item)
            .FirstOrDefaultAsync(o => o.Id == orderId);

        if (order == null) return null;
        if (order.Status != OrderStatus.Criada && order.Status != OrderStatus.Planejada)
            throw new InvalidOperationException("Only draft orders can be modified.");

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
        if (order.Status != OrderStatus.Criada && order.Status != OrderStatus.Planejada)
            throw new InvalidOperationException("Only draft orders can be modified.");

        var oi = order.Items.FirstOrDefault(i => i.ItemId == itemId);
        if (oi == null) return null;

        _db.OrderItems.Remove(oi);
        RecalculateTotal(order);
        order.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return order;
    }

    public async Task<Order?> PlanAsync(int id)
    {
        var order = await _db.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return null;
        if (order.Status != OrderStatus.Criada) throw new InvalidOperationException("Apenas ordens Criadas podem ser planejadas.");
        if (order.Items.Count == 0) throw new InvalidOperationException("Ordem precisa ter ao menos um item para ser planejada.");

        var oldStatus = order.Status;
        order.Status = OrderStatus.Planejada;
        order.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Order", id, "Planejada", new { Status = oldStatus.ToString() }, new { Status = OrderStatus.Planejada.ToString() });
        return order;
    }

    public async Task<Order?> ScheduleAsync(int id, DateTime scheduledDate, DateTime? serviceWindowStart, DateTime? serviceWindowEnd)
    {
        var order = await _db.Orders
            .Include(o => o.DeliverySchedule)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null) return null;
        if (order.Status != OrderStatus.Planejada) throw new InvalidOperationException("Apenas ordens Planejadas podem ser agendadas.");

        var oldStatus = order.Status;

        if (order.DeliverySchedule != null)
        {
            var oldSchedule = new { order.DeliverySchedule.ScheduledDate, order.DeliverySchedule.ServiceWindowStart, order.DeliverySchedule.ServiceWindowEnd };

            order.DeliverySchedule.ScheduledDate = scheduledDate;
            order.DeliverySchedule.ServiceWindowStart = serviceWindowStart;
            order.DeliverySchedule.ServiceWindowEnd = serviceWindowEnd;
            order.DeliverySchedule.UpdatedAt = DateTime.UtcNow;

            order.Status = OrderStatus.Agendada;
            order.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            await _audit.LogAsync("DeliverySchedule", order.DeliverySchedule.Id, "Reagendado", oldSchedule, new { scheduledDate, serviceWindowStart, serviceWindowEnd });
            await _audit.LogAsync("Order", id, "Agendada", new { Status = oldStatus.ToString() }, new { Status = OrderStatus.Agendada.ToString() });
        }
        else
        {
            order.DeliverySchedule = new DeliverySchedule
            {
                OrderId = id,
                ScheduledDate = scheduledDate,
                ServiceWindowStart = serviceWindowStart,
                ServiceWindowEnd = serviceWindowEnd,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            order.Status = OrderStatus.Agendada;
            order.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            await _audit.LogAsync("DeliverySchedule", order.DeliverySchedule.Id, "Criado", null, new { scheduledDate, serviceWindowStart, serviceWindowEnd });
            await _audit.LogAsync("Order", id, "Agendada", new { Status = oldStatus.ToString() }, new { Status = OrderStatus.Agendada.ToString() });
        }

        return order;
    }

    public async Task<Order?> StartTransportAsync(int id)
    {
        var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return null;
        if (order.Status != OrderStatus.Agendada) throw new InvalidOperationException("Apenas ordens Agendadas podem entrar em transporte.");

        order.Status = OrderStatus.EmTransporte;
        order.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Order", id, "EmTransporte", new { Status = OrderStatus.Agendada.ToString() }, new { Status = OrderStatus.EmTransporte.ToString() });
        return order;
    }

    public async Task<Order?> DeliverAsync(int id)
    {
        var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return null;
        if (order.Status != OrderStatus.EmTransporte) throw new InvalidOperationException("Apenas ordens Em Transporte podem ser entregues.");

        order.Status = OrderStatus.Entregue;
        order.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Order", id, "Entregue", new { Status = OrderStatus.EmTransporte.ToString() }, new { Status = OrderStatus.Entregue.ToString() });
        return order;
    }

    public async Task<Order?> CancelAsync(int id)
    {
        var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return null;
        if (order.Status != OrderStatus.Criada && order.Status != OrderStatus.Planejada)
            throw new InvalidOperationException("Apenas ordens Criadas ou Planejadas podem ser canceladas.");

        var oldStatus = order.Status;
        _db.Orders.Remove(order);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Order", id, "Cancelada", new { Status = oldStatus.ToString() }, null);
        return null;
    }

    private void RecalculateTotal(Order order)
        => order.TotalAmount = order.Items.Sum(i => i.Quantity * i.UnitPrice);
}

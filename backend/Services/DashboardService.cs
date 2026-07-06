using Microsoft.EntityFrameworkCore;
using order_hub.Data;
using order_hub.Models;

namespace order_hub.Services;

public class DashboardService : IDashboardService
{
    private readonly AppDbContext _db;

    public DashboardService(AppDbContext db) => _db = db;

    public async Task<object> GetAsync()
    {
        var openOrders = await _db.Orders.CountAsync(o => o.Status == OrderStatus.Draft);
        var confirmedOrders = await _db.Orders.CountAsync(o => o.Status == OrderStatus.Confirmed);
        var scheduledDeliveries = await _db.DeliverySchedules.CountAsync(d => d.Status == DeliveryStatus.Scheduled);

        var recentOrders = await _db.Orders
            .Include(o => o.Customer)
            .OrderByDescending(o => o.CreatedAt)
            .Take(5)
            .Select(o => new
            {
                o.Id,
                CustomerName = o.Customer.Name,
                o.Status,
                o.TotalAmount,
                o.CreatedAt
            })
            .ToListAsync();

        return new { openOrders, confirmedOrders, scheduledDeliveries, recentOrders };
    }
}

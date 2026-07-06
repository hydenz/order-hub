using Microsoft.EntityFrameworkCore;
using order_hub.Data;
using order_hub.Models;

namespace order_hub.Services;

public class DeliveryScheduleService : IDeliveryScheduleService
{
    private readonly AppDbContext _db;
    private readonly IAuditService _audit;

    public DeliveryScheduleService(AppDbContext db, IAuditService audit)
    {
        _db = db;
        _audit = audit;
    }

    public async Task<DeliverySchedule?> GetByOrderIdAsync(int orderId)
        => await _db.DeliverySchedules
            .Include(d => d.TransportType)
            .FirstOrDefaultAsync(d => d.OrderId == orderId);

    public async Task<DeliverySchedule> CreateAsync(int orderId, DeliverySchedule schedule)
    {
        var order = await _db.Orders.FindAsync(orderId)
            ?? throw new InvalidOperationException("Order not found.");

        var existing = await _db.DeliverySchedules.AnyAsync(d => d.OrderId == orderId);
        if (existing) throw new InvalidOperationException("Delivery schedule already exists for this order.");

        schedule.OrderId = orderId;
        schedule.CreatedAt = DateTime.UtcNow;
        schedule.UpdatedAt = DateTime.UtcNow;

        _db.DeliverySchedules.Add(schedule);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("DeliverySchedule", schedule.Id, "Created", null, schedule);
        return schedule;
    }

    public async Task<DeliverySchedule?> UpdateAsync(int orderId, DeliverySchedule updated)
    {
        var schedule = await _db.DeliverySchedules
            .FirstOrDefaultAsync(d => d.OrderId == orderId);

        if (schedule == null) return null;

        var old = new { schedule.ScheduledDate, schedule.TransportTypeId, schedule.Status };

        schedule.ScheduledDate = updated.ScheduledDate;
        schedule.TransportTypeId = updated.TransportTypeId;
        schedule.Status = updated.Status;
        schedule.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        await _audit.LogAsync("DeliverySchedule", schedule.Id, "Updated", old, new { updated.ScheduledDate, updated.TransportTypeId, updated.Status });
        return schedule;
    }
}

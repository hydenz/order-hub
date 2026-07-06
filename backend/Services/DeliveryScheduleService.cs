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
            .FirstOrDefaultAsync(d => d.OrderId == orderId);

    public async Task<DeliverySchedule> CreateOrUpdateAsync(int orderId, DateTime scheduledDate, DateTime? serviceWindowStart, DateTime? serviceWindowEnd)
    {
        var order = await _db.Orders.FindAsync(orderId)
            ?? throw new InvalidOperationException("Order not found.");

        var schedule = await _db.DeliverySchedules
            .FirstOrDefaultAsync(d => d.OrderId == orderId);

        if (schedule != null)
        {
            var old = new { schedule.ScheduledDate, schedule.ServiceWindowStart, schedule.ServiceWindowEnd };

            schedule.ScheduledDate = scheduledDate;
            schedule.ServiceWindowStart = serviceWindowStart;
            schedule.ServiceWindowEnd = serviceWindowEnd;
            schedule.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            await _audit.LogAsync("DeliverySchedule", schedule.Id, "Updated", old, new { scheduledDate, serviceWindowStart, serviceWindowEnd });
            return schedule;
        }

        schedule = new DeliverySchedule
        {
            OrderId = orderId,
            ScheduledDate = scheduledDate,
            ServiceWindowStart = serviceWindowStart,
            ServiceWindowEnd = serviceWindowEnd,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.DeliverySchedules.Add(schedule);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("DeliverySchedule", schedule.Id, "Created", null, new { scheduledDate, serviceWindowStart, serviceWindowEnd });
        return schedule;
    }
}

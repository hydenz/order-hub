using Microsoft.EntityFrameworkCore;
using order_hub.Models;

namespace order_hub.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Item> Items => Set<Item>();
    public DbSet<TransportType> TransportTypes => Set<TransportType>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<DeliverySchedule> DeliverySchedules => Set<DeliverySchedule>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<User> Users => Set<User>();
    public DbSet<CustomerTransportType> CustomerTransportTypes => Set<CustomerTransportType>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<CustomerTransportType>(entity =>
        {
            entity.HasKey(ct => new { ct.CustomerId, ct.TransportTypeId });

            entity.HasOne(ct => ct.Customer)
                .WithMany(c => c.AuthorizedTransportTypes)
                .HasForeignKey(ct => ct.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(ct => ct.TransportType)
                .WithMany(t => t.AuthorizedCustomers)
                .HasForeignKey(ct => ct.TransportTypeId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.Property(o => o.Status)
                .HasConversion<string>()
                .HasMaxLength(20);

            entity.HasOne(o => o.Customer)
                .WithMany(c => c.Orders)
                .HasForeignKey(o => o.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(o => o.TransportType)
                .WithMany()
                .HasForeignKey(o => o.TransportTypeId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(o => o.DeliverySchedule)
                .WithOne(d => d.Order)
                .HasForeignKey<DeliverySchedule>(d => d.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasOne(oi => oi.Order)
                .WithMany(o => o.Items)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(oi => oi.Item)
                .WithMany()
                .HasForeignKey(oi => oi.ItemId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<DeliverySchedule>(entity =>
        {
            entity.HasOne(d => d.Order)
                .WithOne(o => o.DeliverySchedule)
                .HasForeignKey<DeliverySchedule>(d => d.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}

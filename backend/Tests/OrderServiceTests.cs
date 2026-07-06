using Microsoft.EntityFrameworkCore;
using Moq;
using order_hub.Data;
using order_hub.Models;
using order_hub.Models.DTOs;
using order_hub.Services;

namespace order_hub.Tests;

public class OrderServiceTests
{
    private AppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    private async Task SeedTestData(AppDbContext db)
    {
        var customer = new Customer
        {
            Name = "Test Customer",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        db.Customers.Add(customer);
        db.SaveChanges();

        var transport = new TransportType { Name = "Caminhão", Description = "Test", CreatedAt = DateTime.UtcNow };
        db.TransportTypes.Add(transport);

        var transport2 = new TransportType { Name = "Van", Description = "Test", CreatedAt = DateTime.UtcNow };
        db.TransportTypes.Add(transport2);
        db.SaveChanges();

        db.CustomerTransportTypes.Add(new CustomerTransportType
        {
            CustomerId = customer.Id,
            TransportTypeId = transport.Id
        });
        db.SaveChanges();

        var item = new Item
        {
            Name = "Test Item",
            Price = 100m,
            StockQuantity = 10,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        db.Items.Add(item);
        db.SaveChanges();
    }

    [Fact]
    public async Task CreateOrder_WithUnauthorizedTransportType_ShouldThrow()
    {
        using var db = CreateDbContext();
        await SeedTestData(db);
        var auditMock = new Mock<IAuditService>();
        var service = new OrderService(db, auditMock.Object);

        var customer = await db.Customers.FirstAsync();
        var vanTransport = await db.TransportTypes.FirstAsync(t => t.Name == "Van");

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.CreateAsync(customer.Id, vanTransport.Id));

        Assert.Equal("O cliente não possui autorização para este tipo de transporte.", ex.Message);
    }

    [Fact]
    public async Task CreateOrder_WithAuthorizedTransportType_ShouldSucceed()
    {
        using var db = CreateDbContext();
        await SeedTestData(db);
        var auditMock = new Mock<IAuditService>();
        var service = new OrderService(db, auditMock.Object);

        var customer = await db.Customers.FirstAsync();
        var caminhaoTransport = await db.TransportTypes.FirstAsync(t => t.Name == "Caminhão");

        var order = await service.CreateAsync(customer.Id, caminhaoTransport.Id);

        Assert.NotNull(order);
        Assert.Equal(OrderStatus.Criada, order.Status);
        Assert.Equal(customer.Id, order.CustomerId);
        Assert.Equal(caminhaoTransport.Id, order.TransportTypeId);
    }

    [Fact]
    public async Task OrderStatusFlow_ShouldFollowValidTransitions()
    {
        using var db = CreateDbContext();
        await SeedTestData(db);
        var auditMock = new Mock<IAuditService>();
        var service = new OrderService(db, auditMock.Object);

        var customer = await db.Customers.FirstAsync();
        var transport = await db.TransportTypes.FirstAsync(t => t.Name == "Caminhão");
        var item = await db.Items.FirstAsync();

        var order = await service.CreateAsync(customer.Id, transport.Id);
        Assert.Equal(OrderStatus.Criada, order.Status);

        order = await service.AddItemAsync(order.Id, new AddItemRequest(item.Id, 2));
        Assert.NotNull(order);

        order = await service.PlanAsync(order.Id);
        Assert.NotNull(order);
        Assert.Equal(OrderStatus.Planejada, order!.Status);

        var scheduledDate = DateTime.UtcNow.AddDays(7);
        order = await service.ScheduleAsync(order.Id, scheduledDate, scheduledDate.Date.AddHours(8), scheduledDate.Date.AddHours(17));
        Assert.NotNull(order);
        Assert.Equal(OrderStatus.Agendada, order!.Status);
        Assert.NotNull(order.DeliverySchedule);

        order = await service.StartTransportAsync(order.Id);
        Assert.NotNull(order);
        Assert.Equal(OrderStatus.EmTransporte, order!.Status);

        order = await service.DeliverAsync(order.Id);
        Assert.NotNull(order);
        Assert.Equal(OrderStatus.Entregue, order!.Status);
    }

    [Fact]
    public async Task InvalidTransition_ShouldThrow()
    {
        using var db = CreateDbContext();
        await SeedTestData(db);
        var auditMock = new Mock<IAuditService>();
        var service = new OrderService(db, auditMock.Object);

        var customer = await db.Customers.FirstAsync();
        var transport = await db.TransportTypes.FirstAsync(t => t.Name == "Caminhão");

        var order = await service.CreateAsync(customer.Id, transport.Id);

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.StartTransportAsync(order.Id));

        Assert.Equal("Apenas ordens Agendadas podem entrar em transporte.", ex.Message);
    }
}

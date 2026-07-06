using order_hub.Models;

namespace order_hub.Data;

public static class DbSeeder
{
    public static void Seed(AppDbContext db)
    {
        if (!db.Users.Any())
        {
            db.Users.Add(new User
            {
                Username = "admin",
                Email = "admin@orderhub.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                Role = "Admin",
                CreatedAt = DateTime.UtcNow
            });
            db.SaveChanges();
        }

        if (db.Customers.Any()) return;

        var customers = new List<Customer>
        {
            new() { Name = "Tech Solutions Ltda", Email = "contato@techsolutions.com", Phone = "11999990001", Document = "45.123.456/0001-90", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new() { Name = "Comercial Oliveira S.A.", Email = "vendas@oliveira.com", Phone = "11999990002", Document = "45.123.456/0001-91", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new() { Name = "Distribuidora Nova Era", Email = "pedidos@novaera.com", Phone = "11999990003", Document = "45.123.456/0001-92", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new() { Name = "Mercado Livre do Sul", Email = "admin@mlsul.com", Phone = "11999990004", Document = "45.123.456/0001-93", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new() { Name = "Auto Peças Center", Email = "compras@autopecas.com", Phone = "11999990005", Document = "45.123.456/0001-94", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
        };
        db.Customers.AddRange(customers);
        db.SaveChanges();

        var items = new List<Item>
        {
            new() { Name = "Notebook Pro 15\"", Description = "16GB RAM, 512GB SSD", Price = 5999.90m, StockQuantity = 25, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new() { Name = "Monitor 27\" 4K", Description = "Monitor IPS 60Hz", Price = 2499.00m, StockQuantity = 40, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new() { Name = "Teclado Mecânico RGB", Description = "Switch Blue ABNT2", Price = 349.90m, StockQuantity = 100, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new() { Name = "Mouse Sem Fio", Description = "Sensor 4000DPI", Price = 189.90m, StockQuantity = 80, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new() { Name = "Webcam HD 1080p", Description = "Microfone integrado", Price = 299.90m, StockQuantity = 60, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new() { Name = "Fone de Ouvido Bluetooth", Description = "Cancelamento de ruído", Price = 449.90m, StockQuantity = 45, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new() { Name = "SSD 1TB NVMe", Description = "Leitura 3500MB/s", Price = 599.90m, StockQuantity = 70, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new() { Name = "Hub USB-C 7 em 1", Description = "HDMI, USB-A, SD", Price = 159.90m, StockQuantity = 120, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
        };
        db.Items.AddRange(items);
        db.SaveChanges();

        var transports = new List<TransportType>
        {
            new() { Name = "Caminhão", Description = "Transporte rodoviário para cargas fracionadas e completas", CreatedAt = DateTime.UtcNow },
            new() { Name = "Avião", Description = "Transporte aéreo para entregas expressas", CreatedAt = DateTime.UtcNow },
            new() { Name = "Navio", Description = "Transporte marítimo para grandes volumes", CreatedAt = DateTime.UtcNow },
            new() { Name = "Van", Description = "Transporte leve para entregas urbanas", CreatedAt = DateTime.UtcNow },
        };
        db.TransportTypes.AddRange(transports);
        db.SaveChanges();

        var customerTransports = new List<CustomerTransportType>
        {
            new() { CustomerId = customers[0].Id, TransportTypeId = transports[0].Id }, // Caminhão
            new() { CustomerId = customers[0].Id, TransportTypeId = transports[3].Id }, // Van
            new() { CustomerId = customers[1].Id, TransportTypeId = transports[0].Id }, // Caminhão
            new() { CustomerId = customers[1].Id, TransportTypeId = transports[1].Id }, // Avião
            new() { CustomerId = customers[1].Id, TransportTypeId = transports[3].Id }, // Van
            new() { CustomerId = customers[2].Id, TransportTypeId = transports[2].Id }, // Navio
            new() { CustomerId = customers[2].Id, TransportTypeId = transports[0].Id }, // Caminhão
            new() { CustomerId = customers[3].Id, TransportTypeId = transports[3].Id }, // Van
            new() { CustomerId = customers[4].Id, TransportTypeId = transports[0].Id }, // Caminhão
            new() { CustomerId = customers[4].Id, TransportTypeId = transports[3].Id }, // Van
        };
        db.CustomerTransportTypes.AddRange(customerTransports);
        db.SaveChanges();

        var now = DateTime.UtcNow;

        var orders = new List<Order>
        {
            new() { CustomerId = customers[0].Id, TransportTypeId = transports[0].Id, Status = OrderStatus.Criada, TotalAmount = 0, CreatedAt = now.AddDays(-5), UpdatedAt = now.AddDays(-5) },
            new() { CustomerId = customers[1].Id, TransportTypeId = transports[0].Id, Status = OrderStatus.Planejada, TotalAmount = 6349.70m, CreatedAt = now.AddDays(-4), UpdatedAt = now.AddDays(-3) },
            new() { CustomerId = customers[2].Id, TransportTypeId = transports[2].Id, Status = OrderStatus.Agendada, TotalAmount = 2999.70m, CreatedAt = now.AddDays(-3), UpdatedAt = now.AddDays(-2) },
            new() { CustomerId = customers[0].Id, TransportTypeId = transports[0].Id, Status = OrderStatus.EmTransporte, TotalAmount = 4499.00m, CreatedAt = now.AddDays(-10), UpdatedAt = now.AddDays(-1) },
            new() { CustomerId = customers[3].Id, TransportTypeId = transports[3].Id, Status = OrderStatus.Criada, TotalAmount = 0, CreatedAt = now.AddDays(-2), UpdatedAt = now.AddDays(-2) },
            new() { CustomerId = customers[4].Id, TransportTypeId = transports[3].Id, Status = OrderStatus.Planejada, TotalAmount = 549.80m, CreatedAt = now.AddDays(-7), UpdatedAt = now.AddDays(-6) },
            new() { CustomerId = customers[1].Id, TransportTypeId = transports[1].Id, Status = OrderStatus.Entregue, TotalAmount = 1199.80m, CreatedAt = now.AddDays(-1), UpdatedAt = now.AddDays(-1) },
            new() { CustomerId = customers[2].Id, TransportTypeId = transports[0].Id, Status = OrderStatus.Criada, TotalAmount = 0, CreatedAt = now.AddHours(-12), UpdatedAt = now.AddHours(-12) },
        };
        db.Orders.AddRange(orders);
        db.SaveChanges();

        var orderItems = new List<OrderItem>
        {
            new() { OrderId = orders[0].Id, ItemId = items[0].Id, Quantity = 1, UnitPrice = items[0].Price },
            new() { OrderId = orders[0].Id, ItemId = items[2].Id, Quantity = 2, UnitPrice = items[2].Price },
            new() { OrderId = orders[1].Id, ItemId = items[0].Id, Quantity = 1, UnitPrice = items[0].Price },
            new() { OrderId = orders[1].Id, ItemId = items[3].Id, Quantity = 1, UnitPrice = items[3].Price },
            new() { OrderId = orders[1].Id, ItemId = items[7].Id, Quantity = 1, UnitPrice = items[7].Price },
            new() { OrderId = orders[2].Id, ItemId = items[1].Id, Quantity = 1, UnitPrice = items[1].Price },
            new() { OrderId = orders[2].Id, ItemId = items[5].Id, Quantity = 1, UnitPrice = items[5].Price },
            new() { OrderId = orders[3].Id, ItemId = items[4].Id, Quantity = 5, UnitPrice = items[4].Price },
            new() { OrderId = orders[3].Id, ItemId = items[6].Id, Quantity = 5, UnitPrice = items[6].Price },
            new() { OrderId = orders[5].Id, ItemId = items[2].Id, Quantity = 1, UnitPrice = items[2].Price },
            new() { OrderId = orders[5].Id, ItemId = items[3].Id, Quantity = 1, UnitPrice = items[3].Price },
            new() { OrderId = orders[6].Id, ItemId = items[7].Id, Quantity = 3, UnitPrice = items[7].Price },
            new() { OrderId = orders[6].Id, ItemId = items[2].Id, Quantity = 2, UnitPrice = items[2].Price },
        };
        db.OrderItems.AddRange(orderItems);
        db.SaveChanges();

        var schedules = new List<DeliverySchedule>
        {
            new() { OrderId = orders[2].Id, ScheduledDate = now.AddDays(7), ServiceWindowStart = now.AddDays(7).Date.AddHours(8), ServiceWindowEnd = now.AddDays(7).Date.AddHours(17), CreatedAt = now, UpdatedAt = now },
            new() { OrderId = orders[3].Id, ScheduledDate = now.AddDays(2), ServiceWindowStart = now.AddDays(2).Date.AddHours(9), ServiceWindowEnd = now.AddDays(2).Date.AddHours(18), CreatedAt = now, UpdatedAt = now },
            new() { OrderId = orders[6].Id, ScheduledDate = now.AddDays(-2), ServiceWindowStart = now.AddDays(-2).Date.AddHours(8), ServiceWindowEnd = now.AddDays(-2).Date.AddHours(17), CreatedAt = now, UpdatedAt = now },
        };
        db.DeliverySchedules.AddRange(schedules);
        db.SaveChanges();

        var audits = new List<AuditLog>
        {
            new() { EntityType = "Order", EntityId = orders[0].Id, Action = "Criada", OldValues = null, NewValues = "{\"status\":\"Criada\"}", ChangedBy = "system", ChangedAt = now.AddDays(-5) },
            new() { EntityType = "Order", EntityId = orders[1].Id, Action = "Criada", OldValues = null, NewValues = "{\"status\":\"Criada\"}", ChangedBy = "system", ChangedAt = now.AddDays(-4) },
            new() { EntityType = "Order", EntityId = orders[1].Id, Action = "Planejada", OldValues = "{\"status\":\"Criada\"}", NewValues = "{\"status\":\"Planejada\"}", ChangedBy = "system", ChangedAt = now.AddDays(-3) },
            new() { EntityType = "Order", EntityId = orders[2].Id, Action = "Criada", OldValues = null, NewValues = "{\"status\":\"Criada\"}", ChangedBy = "system", ChangedAt = now.AddDays(-3) },
            new() { EntityType = "Order", EntityId = orders[2].Id, Action = "Planejada", OldValues = "{\"status\":\"Criada\"}", NewValues = "{\"status\":\"Planejada\"}", ChangedBy = "system", ChangedAt = now.AddDays(-2) },
            new() { EntityType = "Order", EntityId = orders[2].Id, Action = "Agendada", OldValues = "{\"status\":\"Planejada\"}", NewValues = "{\"status\":\"Agendada\"}", ChangedBy = "system", ChangedAt = now.AddDays(-2).AddHours(2) },
            new() { EntityType = "DeliverySchedule", EntityId = schedules[0].Id, Action = "Created", OldValues = null, NewValues = "{\"scheduledDate\":\"" + now.AddDays(7).ToString("O") + "\"}", ChangedBy = "system", ChangedAt = now.AddDays(-2).AddHours(2) },
            new() { EntityType = "Order", EntityId = orders[3].Id, Action = "Criada", OldValues = null, NewValues = "{\"status\":\"Criada\"}", ChangedBy = "system", ChangedAt = now.AddDays(-10) },
            new() { EntityType = "Order", EntityId = orders[3].Id, Action = "Planejada", OldValues = "{\"status\":\"Criada\"}", NewValues = "{\"status\":\"Planejada\"}", ChangedBy = "system", ChangedAt = now.AddDays(-9) },
            new() { EntityType = "Order", EntityId = orders[3].Id, Action = "Agendada", OldValues = "{\"status\":\"Planejada\"}", NewValues = "{\"status\":\"Agendada\"}", ChangedBy = "system", ChangedAt = now.AddDays(-5) },
            new() { EntityType = "Order", EntityId = orders[3].Id, Action = "EmTransporte", OldValues = "{\"status\":\"Agendada\"}", NewValues = "{\"status\":\"EmTransporte\"}", ChangedBy = "system", ChangedAt = now.AddDays(-1) },
            new() { EntityType = "Order", EntityId = orders[5].Id, Action = "Criada", OldValues = null, NewValues = "{\"status\":\"Criada\"}", ChangedBy = "system", ChangedAt = now.AddDays(-7) },
            new() { EntityType = "Order", EntityId = orders[5].Id, Action = "Planejada", OldValues = "{\"status\":\"Criada\"}", NewValues = "{\"status\":\"Planejada\"}", ChangedBy = "system", ChangedAt = now.AddDays(-6) },
            new() { EntityType = "Order", EntityId = orders[6].Id, Action = "Criada", OldValues = null, NewValues = "{\"status\":\"Criada\"}", ChangedBy = "system", ChangedAt = now.AddDays(-1) },
            new() { EntityType = "Order", EntityId = orders[6].Id, Action = "Planejada", OldValues = "{\"status\":\"Criada\"}", NewValues = "{\"status\":\"Planejada\"}", ChangedBy = "system", ChangedAt = now.AddDays(-1).AddHours(2) },
            new() { EntityType = "Order", EntityId = orders[6].Id, Action = "Agendada", OldValues = "{\"status\":\"Planejada\"}", NewValues = "{\"status\":\"Agendada\"}", ChangedBy = "system", ChangedAt = now.AddDays(-1).AddHours(3) },
            new() { EntityType = "Order", EntityId = orders[6].Id, Action = "EmTransporte", OldValues = "{\"status\":\"Agendada\"}", NewValues = "{\"status\":\"EmTransporte\"}", ChangedBy = "system", ChangedAt = now.AddDays(-1).AddHours(5) },
            new() { EntityType = "Order", EntityId = orders[6].Id, Action = "Entregue", OldValues = "{\"status\":\"EmTransporte\"}", NewValues = "{\"status\":\"Entregue\"}", ChangedBy = "system", ChangedAt = now.AddDays(-1).AddHours(7) },
        };
        db.AuditLogs.AddRange(audits);
        db.SaveChanges();

        orders[0].Items.Add(orderItems[0]);
        orders[0].Items.Add(orderItems[1]);
        orders[1].Items.Add(orderItems[2]);
        orders[1].Items.Add(orderItems[3]);
        orders[1].Items.Add(orderItems[4]);
        orders[2].Items.Add(orderItems[5]);
        orders[2].Items.Add(orderItems[6]);
        orders[3].Items.Add(orderItems[7]);
        orders[3].Items.Add(orderItems[8]);
        orders[5].Items.Add(orderItems[9]);
        orders[5].Items.Add(orderItems[10]);
        orders[6].Items.Add(orderItems[11]);
        orders[6].Items.Add(orderItems[12]);

        orders[0].TotalAmount = orderItems[0].Quantity * orderItems[0].UnitPrice + orderItems[1].Quantity * orderItems[1].UnitPrice;
        orders[1].TotalAmount = orderItems[2].Quantity * orderItems[2].UnitPrice + orderItems[3].Quantity * orderItems[3].UnitPrice + orderItems[4].Quantity * orderItems[4].UnitPrice;
        orders[2].TotalAmount = orderItems[5].Quantity * orderItems[5].UnitPrice + orderItems[6].Quantity * orderItems[6].UnitPrice;
        orders[3].TotalAmount = orderItems[7].Quantity * orderItems[7].UnitPrice + orderItems[8].Quantity * orderItems[8].UnitPrice;
        orders[5].TotalAmount = orderItems[9].Quantity * orderItems[9].UnitPrice + orderItems[10].Quantity * orderItems[10].UnitPrice;
        orders[6].TotalAmount = orderItems[11].Quantity * orderItems[11].UnitPrice + orderItems[12].Quantity * orderItems[12].UnitPrice;

        db.SaveChanges();
    }
}

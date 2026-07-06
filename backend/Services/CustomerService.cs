using Microsoft.EntityFrameworkCore;
using order_hub.Data;
using order_hub.Models;

namespace order_hub.Services;

public class CustomerService : ICustomerService
{
    private readonly AppDbContext _db;
    private readonly IAuditService _audit;

    public CustomerService(AppDbContext db, IAuditService audit)
    {
        _db = db;
        _audit = audit;
    }

    public async Task<List<Customer>> GetAllAsync()
        => await _db.Customers
            .Include(c => c.AuthorizedTransportTypes)
            .ThenInclude(ct => ct.TransportType)
            .OrderByDescending(c => c.CreatedAt).ToListAsync();

    public async Task<Customer?> GetByIdAsync(int id)
        => await _db.Customers
            .Include(c => c.Orders)
                .ThenInclude(o => o.Items)
            .Include(c => c.AuthorizedTransportTypes)
                .ThenInclude(ct => ct.TransportType)
            .FirstOrDefaultAsync(c => c.Id == id);

    public async Task<Customer> CreateAsync(Customer customer)
    {
        customer.CreatedAt = DateTime.UtcNow;
        customer.UpdatedAt = DateTime.UtcNow;
        _db.Customers.Add(customer);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Customer", customer.Id, "Created", null, customer);
        return customer;
    }

    public async Task<Customer?> UpdateAsync(int id, Customer updated)
    {
        var customer = await _db.Customers.FindAsync(id);
        if (customer == null) return null;

        var old = new { customer.Name, customer.Email, customer.Phone, customer.Document };

        customer.Name = updated.Name;
        customer.Email = updated.Email;
        customer.Phone = updated.Phone;
        customer.Document = updated.Document;
        customer.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        await _audit.LogAsync("Customer", id, "Updated", old, new { updated.Name, updated.Email, updated.Phone, updated.Document });
        return customer;
    }

    public async Task<(bool Success, string? Error)> DeleteAsync(int id)
    {
        var customer = await _db.Customers.FindAsync(id);
        if (customer == null) return (false, null);

        var hasOrders = await _db.Orders.AnyAsync(o => o.CustomerId == id);
        if (hasOrders) return (false, "Cliente possui pedidos vinculados e não pode ser excluído.");

        _db.Customers.Remove(customer);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Customer", id, "Deleted", customer, null);
        return (true, null);
    }

    public async Task<List<TransportType>> GetAuthorizedTransportTypesAsync(int customerId)
    {
        if (!await _db.Customers.AnyAsync(c => c.Id == customerId))
            throw new InvalidOperationException("Cliente não encontrado.");

        return await _db.CustomerTransportTypes
            .Where(ct => ct.CustomerId == customerId)
            .Include(ct => ct.TransportType)
            .Select(ct => ct.TransportType)
            .ToListAsync();
    }

    public async Task AuthorizeTransportTypeAsync(int customerId, int transportTypeId)
    {
        if (!await _db.Customers.AnyAsync(c => c.Id == customerId))
            throw new InvalidOperationException("Cliente não encontrado.");

        if (!await _db.TransportTypes.AnyAsync(t => t.Id == transportTypeId))
            throw new InvalidOperationException("Tipo de transporte não encontrado.");

        var exists = await _db.CustomerTransportTypes.AnyAsync(ct => ct.CustomerId == customerId && ct.TransportTypeId == transportTypeId);
        if (exists) return;

        _db.CustomerTransportTypes.Add(new CustomerTransportType
        {
            CustomerId = customerId,
            TransportTypeId = transportTypeId
        });

        await _db.SaveChangesAsync();
        await _audit.LogAsync("Customer", customerId, "TransportTypeAuthorized", null, new { TransportTypeId = transportTypeId });
    }

    public async Task UnauthorizeTransportTypeAsync(int customerId, int transportTypeId)
    {
        var ct = await _db.CustomerTransportTypes
            .FirstOrDefaultAsync(ct => ct.CustomerId == customerId && ct.TransportTypeId == transportTypeId);

        if (ct == null) return;

        _db.CustomerTransportTypes.Remove(ct);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Customer", customerId, "TransportTypeUnauthorized", new { TransportTypeId = transportTypeId }, null);
    }
}

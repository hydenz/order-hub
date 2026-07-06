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
        => await _db.Customers.OrderByDescending(c => c.CreatedAt).ToListAsync();

    public async Task<Customer?> GetByIdAsync(int id)
        => await _db.Customers
            .Include(c => c.Orders)
            .ThenInclude(o => o.Items)
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

    public async Task<bool> DeleteAsync(int id)
    {
        var customer = await _db.Customers.FindAsync(id);
        if (customer == null) return false;

        _db.Customers.Remove(customer);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Customer", id, "Deleted", customer, null);
        return true;
    }
}

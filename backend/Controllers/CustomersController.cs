using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using order_hub.Models;
using order_hub.Services;

namespace order_hub.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CustomersController : ControllerBase
{
    private readonly ICustomerService _service;
    public CustomersController(ICustomerService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll()
        => Ok(await _service.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var customer = await _service.GetByIdAsync(id);
        return customer == null ? NotFound() : Ok(customer);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Customer customer)
        => CreatedAtAction(nameof(GetById), new { id = customer.Id }, await _service.CreateAsync(customer));

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Customer customer)
    {
        var result = await _service.UpdateAsync(id, customer);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
        => await _service.DeleteAsync(id) ? NoContent() : NotFound();
}

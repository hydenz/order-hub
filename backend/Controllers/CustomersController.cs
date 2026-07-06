using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using order_hub.Models;
using order_hub.Models.DTOs;
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
    public async Task<IActionResult> Create([FromBody] CreateCustomerRequest request)
    {
        var customer = new Customer
        {
            Name = request.Name,
            Email = request.Email,
            Phone = request.Phone,
            Document = request.Document
        };
        var created = await _service.CreateAsync(customer);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateCustomerRequest request)
    {
        var customer = new Customer
        {
            Name = request.Name,
            Email = request.Email,
            Phone = request.Phone,
            Document = request.Document
        };
        var result = await _service.UpdateAsync(id, customer);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var (success, error) = await _service.DeleteAsync(id);
        if (error != null) return Conflict(new { message = error });
        return success ? NoContent() : NotFound();
    }

    [HttpGet("{id}/transport-types")]
    public async Task<IActionResult> GetAuthorizedTransportTypes(int id)
    {
        try
        {
            var types = await _service.GetAuthorizedTransportTypesAsync(id);
            return Ok(types);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPost("{id}/transport-types")]
    public async Task<IActionResult> AuthorizeTransportType(int id, [FromBody] AuthorizeTransportRequest request)
    {
        try
        {
            await _service.AuthorizeTransportTypeAsync(id, request.TransportTypeId);
            return Ok();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}/transport-types/{transportTypeId}")]
    public async Task<IActionResult> UnauthorizeTransportType(int id, int transportTypeId)
    {
        await _service.UnauthorizeTransportTypeAsync(id, transportTypeId);
        return NoContent();
    }
}

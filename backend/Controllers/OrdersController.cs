using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using order_hub.Services;

namespace order_hub.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _service;
    public OrdersController(IOrderService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? status)
        => Ok(await _service.GetAllAsync(status));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var order = await _service.GetByIdAsync(id);
        return order == null ? NotFound() : Ok(order);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateOrderRequest request)
        => CreatedAtAction(nameof(GetById), new { id = 0 }, await _service.CreateAsync(request.CustomerId));

    [HttpPost("{id}/items")]
    public async Task<IActionResult> AddItem(int id, AddItemRequest request)
    {
        try
        {
            var order = await _service.AddItemAsync(id, request);
            return order == null ? NotFound() : Ok(order);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id}/items/{itemId}")]
    public async Task<IActionResult> RemoveItem(int id, int itemId)
    {
        try
        {
            var order = await _service.RemoveItemAsync(id, itemId);
            return order == null ? NotFound() : Ok(order);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}/confirm")]
    public async Task<IActionResult> Confirm(int id)
    {
        try
        {
            var order = await _service.ConfirmAsync(id);
            return order == null ? NotFound() : Ok(order);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}/cancel")]
    public async Task<IActionResult> Cancel(int id)
    {
        try
        {
            var order = await _service.CancelAsync(id);
            return order == null ? NotFound() : Ok(order);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}/ship")]
    public async Task<IActionResult> Ship(int id)
    {
        try
        {
            var order = await _service.ShipAsync(id);
            return order == null ? NotFound() : Ok(order);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}/deliver")]
    public async Task<IActionResult> Deliver(int id)
    {
        try
        {
            var order = await _service.DeliverAsync(id);
            return order == null ? NotFound() : Ok(order);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}

public record CreateOrderRequest(int CustomerId);

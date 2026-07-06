using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using order_hub.Models.DTOs;
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
    public async Task<IActionResult> GetAll(
        [FromQuery] string? status,
        [FromQuery] int? customerId,
        [FromQuery] int? transportTypeId,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
        => Ok(await _service.GetAllAsync(status, customerId, transportTypeId, startDate, endDate));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var order = await _service.GetByIdAsync(id);
        return order == null ? NotFound() : Ok(order);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateOrderRequest request)
    {
        try
        {
            var order = await _service.CreateAsync(request.CustomerId, request.TransportTypeId, request.Items);
            return CreatedAtAction(nameof(GetById), new { id = order.Id }, order);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

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
            return BadRequest(new { message = ex.Message });
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
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}/plan")]
    public async Task<IActionResult> Plan(int id)
    {
        try
        {
            var order = await _service.PlanAsync(id);
            return order == null ? NotFound() : Ok(order);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}/schedule")]
    public async Task<IActionResult> Schedule(int id, [FromBody] ScheduleRequest request)
    {
        try
        {
            var order = await _service.ScheduleAsync(id, request.ScheduledDate, request.ServiceWindowStart, request.ServiceWindowEnd);
            return order == null ? NotFound() : Ok(order);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}/start-transport")]
    public async Task<IActionResult> StartTransport(int id)
    {
        try
        {
            var order = await _service.StartTransportAsync(id);
            return order == null ? NotFound() : Ok(order);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
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
            return BadRequest(new { message = ex.Message });
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
            return BadRequest(new { message = ex.Message });
        }
    }
}

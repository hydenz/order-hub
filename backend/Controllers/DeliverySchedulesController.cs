using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using order_hub.Models;
using order_hub.Services;

namespace order_hub.Controllers;

[ApiController]
[Route("api/orders/{orderId}/delivery")]
[Authorize]
public class DeliverySchedulesController : ControllerBase
{
    private readonly IDeliveryScheduleService _service;
    public DeliverySchedulesController(IDeliveryScheduleService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> Get(int orderId)
    {
        var delivery = await _service.GetByOrderIdAsync(orderId);
        return delivery == null ? NotFound() : Ok(delivery);
    }

    [HttpPost]
    public async Task<IActionResult> Create(int orderId, DeliverySchedule schedule)
    {
        try
        {
            var result = await _service.CreateAsync(orderId, schedule);
            return CreatedAtAction(nameof(Get), new { orderId }, result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut]
    public async Task<IActionResult> Update(int orderId, DeliverySchedule schedule)
    {
        var result = await _service.UpdateAsync(orderId, schedule);
        return result == null ? NotFound() : Ok(result);
    }
}

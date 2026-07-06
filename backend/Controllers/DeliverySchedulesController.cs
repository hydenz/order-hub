using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using order_hub.Models.DTOs;
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
    public async Task<IActionResult> CreateOrUpdate(int orderId, [FromBody] DeliveryRequest request)
    {
        try
        {
            var result = await _service.CreateOrUpdateAsync(orderId, request.ScheduledDate, request.ServiceWindowStart, request.ServiceWindowEnd);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

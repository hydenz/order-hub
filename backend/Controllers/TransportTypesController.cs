using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using order_hub.Models;
using order_hub.Services;

namespace order_hub.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TransportTypesController : ControllerBase
{
    private readonly ITransportTypeService _service;
    public TransportTypesController(ITransportTypeService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll()
        => Ok(await _service.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var t = await _service.GetByIdAsync(id);
        return t == null ? NotFound() : Ok(t);
    }

    [HttpPost]
    public async Task<IActionResult> Create(TransportType transportType)
        => CreatedAtAction(nameof(GetById), new { id = transportType.Id }, await _service.CreateAsync(transportType));

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, TransportType transportType)
    {
        var result = await _service.UpdateAsync(id, transportType);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
        => await _service.DeleteAsync(id) ? NoContent() : NotFound();
}

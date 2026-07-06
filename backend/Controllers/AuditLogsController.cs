using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using order_hub.Services;

namespace order_hub.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AuditLogsController : ControllerBase
{
    private readonly IAuditLogService _service;
    public AuditLogsController(IAuditLogService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        => Ok(await _service.GetAllAsync(page, pageSize));
}

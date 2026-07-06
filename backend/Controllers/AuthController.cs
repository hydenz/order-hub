using Microsoft.AspNetCore.Mvc;
using order_hub.Services;

namespace order_hub.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth) => _auth = auth;

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var result = await _auth.LoginAsync(request);
        return result == null ? Unauthorized(new { message = "Invalid credentials" }) : Ok(result);
    }
}

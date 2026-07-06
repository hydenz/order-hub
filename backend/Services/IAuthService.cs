namespace order_hub.Services;

public record LoginRequest(string Username, string Password);

public record LoginResponse(string Token, string Username, string Role);

public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(LoginRequest request);
}

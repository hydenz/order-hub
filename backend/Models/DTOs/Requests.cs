using System.ComponentModel.DataAnnotations;

namespace order_hub.Models.DTOs;

public record CreateCustomerRequest(
    [Required, MaxLength(200)] string Name,
    [MaxLength(200)] string? Email,
    [MaxLength(20)] string? Phone,
    [MaxLength(20)] string? Document
);

public record UpdateCustomerRequest(
    [Required, MaxLength(200)] string Name,
    [MaxLength(200)] string? Email,
    [MaxLength(20)] string? Phone,
    [MaxLength(20)] string? Document
);

public record CreateItemRequest(
    [Required, MaxLength(200)] string Name,
    [MaxLength(500)] string? Description,
    [Required] decimal Price,
    int StockQuantity
);

public record UpdateItemRequest(
    [Required, MaxLength(200)] string Name,
    [MaxLength(500)] string? Description,
    [Required] decimal Price,
    int StockQuantity
);

public record CreateTransportTypeRequest(
    [Required, MaxLength(100)] string Name,
    [MaxLength(500)] string? Description
);

public record UpdateTransportTypeRequest(
    [Required, MaxLength(100)] string Name,
    [MaxLength(500)] string? Description
);

public record OrderItemRequest(
    [Required] int ItemId,
    [Required, Range(1, int.MaxValue)] int Quantity
);

public record CreateOrderRequest(
    [Required] int CustomerId,
    [Required] int TransportTypeId,
    List<OrderItemRequest>? Items
);

public record AddItemRequest(
    [Required] int ItemId,
    [Required, Range(1, int.MaxValue)] int Quantity
);

public record ScheduleRequest(
    [Required] DateTime ScheduledDate,
    DateTime? ServiceWindowStart,
    DateTime? ServiceWindowEnd
);

public record AuthorizeTransportRequest(
    [Required] int TransportTypeId
);

public record DeliveryRequest(
    [Required] DateTime ScheduledDate,
    DateTime? ServiceWindowStart,
    DateTime? ServiceWindowEnd
);

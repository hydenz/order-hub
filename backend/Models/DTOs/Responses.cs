namespace order_hub.Models.DTOs;

public record CustomerResponse(
    int Id,
    string Name,
    string? Email,
    string? Phone,
    string? Document,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    List<TransportTypeResponse> AuthorizedTransportTypes,
    List<OrderSummaryResponse>? Orders
);

public record TransportTypeResponse(
    int Id,
    string Name,
    string? Description,
    DateTime CreatedAt
);

public record OrderSummaryResponse(
    int Id,
    string Status,
    decimal TotalAmount,
    DateTime CreatedAt,
    int ItemsCount
);

public record OrderResponse(
    int Id,
    int CustomerId,
    string CustomerName,
    int TransportTypeId,
    string TransportTypeName,
    string Status,
    decimal TotalAmount,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    List<OrderItemResponse> Items,
    DeliveryScheduleResponse? DeliverySchedule
);

public record OrderItemResponse(
    int Id,
    int ItemId,
    string ItemName,
    int Quantity,
    decimal UnitPrice,
    decimal Subtotal
);

public record DeliveryScheduleResponse(
    int Id,
    int OrderId,
    DateTime ScheduledDate,
    DateTime? ServiceWindowStart,
    DateTime? ServiceWindowEnd,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record ItemResponse(
    int Id,
    string Name,
    string? Description,
    decimal Price,
    int StockQuantity,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record AuditLogResponse(
    int Id,
    string EntityType,
    int EntityId,
    string Action,
    string? OldValues,
    string? NewValues,
    string? ChangedBy,
    DateTime ChangedAt
);

public record DashboardResponse(
    int Criadas,
    int Agendadas,
    int EmTransporte,
    List<RecentOrderResponse> RecentOrders
);

public record RecentOrderResponse(
    int Id,
    string CustomerName,
    string Status,
    decimal TotalAmount,
    DateTime CreatedAt
);

public record PagedResponse<T>(
    List<T> Items,
    int Total,
    int Page,
    int PageSize
);

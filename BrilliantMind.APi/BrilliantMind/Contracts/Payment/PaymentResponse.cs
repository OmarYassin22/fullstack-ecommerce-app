using BrilliantMind.Data.Model;

namespace BrilliantMind.Contracts.Payment;

public record PaymentResponse(
    int Id,
    int OrderId,
    decimal Amount,
    string Currency,
    PaymentStatus Status,
    string? PayPalOrderId,
    string? TransactionId,
    string? PayerEmail,
    string? PayerName,
    DateTime CreatedDate,
    DateTime? ProcessedDate,
    DateTime? CompletedDate,
    string? FailureReason
);

public record CreatePaymentResponse(
    int PaymentId,
    string? PayPalOrderId,
    string? ApprovalUrl,
    PaymentStatus Status,
    string? ErrorMessage = null
);

public record CapturePaymentResponse(
    int PaymentId,
    string? TransactionId,
    PaymentStatus Status,
    string? ErrorMessage = null
);
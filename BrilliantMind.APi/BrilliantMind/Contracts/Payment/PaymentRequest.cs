namespace BrilliantMind.Contracts.Payment;

public record CreatePaymentRequest(
    int OrderId,
    decimal Amount,
    string Currency = "USD",
     string? ReturnUrl = null,
    string? CancelUrl = null
);

public record CapturePaymentRequest(
    string PayPalOrderId
);

public record RefundPaymentRequest(
    int PaymentId,
    decimal? Amount = null, // If null, full refund
    string? Reason = null
);


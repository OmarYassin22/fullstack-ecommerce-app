using BrilliantMind.Contracts.Payment;

namespace BrilliantMind.Interfaces;


public interface IPayPalService
{
    Task<CreatePaymentResponse> CreateOrderAsync(string userId, CreatePaymentRequest request);
    Task<CapturePaymentResponse> CaptureOrderAsync(string payPalOrderId);
    Task<bool> RefundPaymentAsync(string transactionId, decimal amount, string reason);
    Task<PaymentResponse?> GetPaymentDetailsAsync(string payPalOrderId);
    Task<string> GetOrderStatusAsync(string payPalOrderId); // Add this
}
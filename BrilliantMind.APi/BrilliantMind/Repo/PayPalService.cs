using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using BeetElward.Contracts.Payment;
using BeetElward.Data;
using BeetElward.Data.Model;
using BeetElward.Interfaces;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace BeetElward.Repo;

public class PayPalService(HttpClient httpClient, IConfiguration configuration, ApPDbContext context) : IPayPalService
{
    private readonly HttpClient _httpClient = httpClient;
    private readonly IConfiguration _configuration = configuration;
    private readonly ApPDbContext _context = context;

    private string ClientId => _configuration["PayPal:ClientId"] ?? throw new InvalidOperationException("PayPal ClientId not configured");
    private string ClientSecret => _configuration["PayPal:ClientSecret"] ?? throw new InvalidOperationException("PayPal ClientSecret not configured");
    private string BaseUrl => _configuration["PayPal:BaseUrl"];

    public async Task<CreatePaymentResponse> CreateOrderAsync(string userId, CreatePaymentRequest request)
    {
        try
        {
            var accessToken = await GetAccessTokenAsync();

            var order = await _context.Orders
                .Include(o => o.Books)
                .FirstOrDefaultAsync(o => o.Id == request.OrderId);
            var orderBookIds = order.Books.Select(b => b.Id).ToList();
            var hasOrderedBooks = await _context.UserBooks
                .Where(ub => ub.UserId == userId && orderBookIds.Contains(ub.BookId.Value))
                .AnyAsync();

            if (hasOrderedBooks)
            {
                return new CreatePaymentResponse(0, null, null, PaymentStatus.Failed, "User Already Have Ordered Book");
            }
            if (order == null)
            {
                return new CreatePaymentResponse(0, null, null, PaymentStatus.Failed, "Order not found");
            }
            var orderAmount = order.TotalPrice ?? 0;

            var payPalOrder = new
            {
                intent = "CAPTURE",
                purchase_units = new[]
                {
                    new
                    {
                        amount = new
                        {
                            currency_code = request.Currency,
                        value = orderAmount.ToString("F2") // Consistent F2 formatting
                        },
                        description = $"Order #{order.Id} - {order.Books.Count} book(s)"
                    }
                },
                application_context = new
                {
                    return_url = request.ReturnUrl ?? _configuration["PayPal:ReturnUrl"],
                    cancel_url = request.CancelUrl ?? _configuration["PayPal:CancelUrl"]
                }
            };

            var json = JsonSerializer.Serialize(payPalOrder);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Create a new request message to avoid header conflicts
            using var requestMessage = new HttpRequestMessage(HttpMethod.Post, $"{BaseUrl}/v2/checkout/orders");
            requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            requestMessage.Content = content;

            var response = await _httpClient.SendAsync(requestMessage);
            var responseContent = await response.Content.ReadAsStringAsync();

            if (response.IsSuccessStatusCode)
            {
                var payPalResponse = JsonSerializer.Deserialize<PayPalOrderResponse>(responseContent, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });
                var approvalUrl = payPalResponse?.Links?.FirstOrDefault(l => l.Rel == "approve")?.Href;

                // Create payment record
                var payment = new Payment
                {
                    OrderId = request.OrderId,
                    UserId = order.UserId,
                    Amount = order.TotalPrice ?? 0, // Fixed nullable issue
                    Currency = request.Currency,
                    Status = PaymentStatus.Pending,
                    PayPalOrderId = payPalResponse?.Id,
                    PaymentGatewayResponse = responseContent
                };

                _context.Payments.Add(payment);
                await _context.SaveChangesAsync();

                return new CreatePaymentResponse(
                    payment.Id,
                    payPalResponse?.Id,
                    approvalUrl,
                    PaymentStatus.Pending
                );
            }
            else
            {
                return new CreatePaymentResponse(0, null, null, PaymentStatus.Failed, responseContent);
            }
        }
        catch (Exception ex)
        {
            return new CreatePaymentResponse(0, null, null, PaymentStatus.Failed, ex.Message);
        }
    }

    public async Task<string> GetOrderStatusAsync(string payPalOrderId)
    {
        try
        {
            var accessToken = await GetAccessTokenAsync();

            using var requestMessage = new HttpRequestMessage(HttpMethod.Get, $"{BaseUrl}/v2/checkout/orders/{payPalOrderId}");
            requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            var response = await _httpClient.SendAsync(requestMessage);
            var responseContent = await response.Content.ReadAsStringAsync();

            return responseContent;
        }
        catch (Exception ex)
        {
            return $"Error: {ex.Message}";
        }
    }

    public async Task<CapturePaymentResponse> CaptureOrderAsync(string payPalOrderId)
    {
        try
        {
            var orderStatus = await GetOrderStatusAsync(payPalOrderId);
            Console.WriteLine($"Order Status Response: {orderStatus}"); // Add logging

            var orderResponse = JsonSerializer.Deserialize<PayPalOrderResponse>(orderStatus, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
            Console.WriteLine($"Parsed Order Status: {orderResponse?.Status}"); // Add logging

            if (orderResponse?.Status != "APPROVED")
            {
                return new CapturePaymentResponse(0, null, PaymentStatus.Failed,
                    $"Order status is '{orderResponse?.Status}', must be 'APPROVED' to capture. Customer needs to approve the payment first.");
            }

            var accessToken = await GetAccessTokenAsync();
            var payment = await _context.Payments.FirstOrDefaultAsync(p => p.PayPalOrderId == payPalOrderId);

            if (payment == null)
            {
                return new CapturePaymentResponse(0, null, PaymentStatus.Failed, "Payment not found");
            }

            using var requestMessage = new HttpRequestMessage(HttpMethod.Post, $"{BaseUrl}/v2/checkout/orders/{payPalOrderId}/capture");
            requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            // Add empty JSON content with proper Content-Type header
            requestMessage.Content = new StringContent("{}", Encoding.UTF8, "application/json");

            Console.WriteLine($"Capture Request URL: {requestMessage.RequestUri}"); // Add logging

            var response = await _httpClient.SendAsync(requestMessage);
            var responseContent = await response.Content.ReadAsStringAsync();

            Console.WriteLine($"Capture Response Status: {response.StatusCode}"); // Add logging
            Console.WriteLine($"Capture Response Content: {responseContent}"); // Add logging


            if (response.IsSuccessStatusCode)
            {
                var captureResponse = JsonSerializer.Deserialize<PayPalCaptureResponse>(responseContent, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });
                var capture = captureResponse?.PurchaseUnits?.FirstOrDefault()?.Payments?.Captures?.FirstOrDefault();

                payment.Status = PaymentStatus.Completed;
                payment.TransactionId = capture?.Id;
                payment.PayerEmail = captureResponse?.Payer?.EmailAddress;
                payment.PayerName = $"{captureResponse?.Payer?.Name?.GivenName} {captureResponse?.Payer?.Name?.Surname}";
                payment.CompletedDate = DateTime.UtcNow;
                payment.ProcessedDate = DateTime.UtcNow;
                payment.PaymentGatewayResponse = responseContent;

                // Update order status
                var order = await _context.Orders.Include(o => o.Books).FirstOrDefaultAsync(o => o.Id == payment.OrderId);
                if (order != null)
                {
                    order.Status = OrderStatus.Completed;
                    order.TransactionId = capture?.Id;
                    order.UpdatedDate = DateTime.UtcNow;
                    foreach (var book in order.Books)
                    {
                        // Check if already exists to avoid duplicates
                        var exists = await _context.UserBooks
                            .AnyAsync(ub => ub.BookId == book.Id && ub.UserId == order.UserId);
                        if (!exists)
                        {
                            _context.UserBooks.Add(new UserBooks
                            {
                                BookId = book.Id,
                                UserId = order.UserId
                            });
                        }
                    }
                }

                await _context.SaveChangesAsync();

                return new CapturePaymentResponse(
                    payment.Id,
                    capture?.Id,
                    PaymentStatus.Completed
                );
            }
            else
            {
                Console.WriteLine($"Capture Failed - Status: {response.StatusCode}, Response: {responseContent}");

                payment.Status = PaymentStatus.Failed;
                payment.FailureReason = responseContent;
                payment.ProcessedDate = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return new CapturePaymentResponse(payment.Id, null, PaymentStatus.Failed, responseContent);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Capture Exception: {ex.Message}"); // Add logging

            return new CapturePaymentResponse(0, null, PaymentStatus.Failed, ex.Message);
        }
    }

    public async Task<bool> RefundPaymentAsync(string transactionId, decimal amount, string reason)
    {
        try
        {
            var accessToken = await GetAccessTokenAsync();

            var refundRequest = new
            {
                amount = new
                {
                    value = amount.ToString("F2"),
                    currency_code = "USD"
                },
                note_to_payer = reason
            };

            var json = JsonSerializer.Serialize(refundRequest);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            using var requestMessage = new HttpRequestMessage(HttpMethod.Post, $"{BaseUrl}/v2/payments/captures/{transactionId}/refund");
            requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            requestMessage.Content = content;

            var response = await _httpClient.SendAsync(requestMessage);
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    public async Task<PaymentResponse?> GetPaymentDetailsAsync(string payPalOrderId)
    {
        var payment = await _context.Payments
            .FirstOrDefaultAsync(p => p.PayPalOrderId == payPalOrderId);

        return payment?.Adapt<PaymentResponse>();
    }

    //private async Task<string> GetAccessTokenAsync()
    //{
    //    var authValue = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{ClientId}:{ClientSecret}"));

    //    var content = new FormUrlEncodedContent(new[]
    //    {
    //        new KeyValuePair<string, string>("grant_type", "client_credentials")
    //    });

    //    using var requestMessage = new HttpRequestMessage(HttpMethod.Post, $"{BaseUrl}/v1/oauth2/token");
    //    requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Basic", authValue);
    //    requestMessage.Content = content;

    //    var response = await _httpClient.SendAsync(requestMessage);
    //    var responseContent = await response.Content.ReadAsStringAsync();

    //    if (response.IsSuccessStatusCode)
    //    {
    //        var tokenResponse = JsonSerializer.Deserialize<PayPalTokenResponse>(responseContent, new JsonSerializerOptions
    //        {
    //            PropertyNameCaseInsensitive = true
    //        });
    //        return tokenResponse?.AccessToken ?? throw new InvalidOperationException("Failed to get access token");
    //    }

    //    throw new InvalidOperationException($"Failed to authenticate with PayPal: Status: {response.StatusCode}, Response: {responseContent}");
    //}

    private async Task<string> GetAccessTokenAsync()
    {
        var authValue = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{ClientId}:{ClientSecret}"));

        var content = new FormUrlEncodedContent(new[]
        {
        new KeyValuePair<string, string>("grant_type", "client_credentials")
    });

        using var requestMessage = new HttpRequestMessage(HttpMethod.Post, $"{BaseUrl}/v1/oauth2/token");
        requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Basic", authValue);
        requestMessage.Content = content;

        // Safe logging only (no secrets)
        Console.WriteLine($"PayPal Auth URL: {BaseUrl}/v1/oauth2/token");

        var response = await _httpClient.SendAsync(requestMessage);
        var responseContent = await response.Content.ReadAsStringAsync();

        Console.WriteLine($"Auth Response Status: {response.StatusCode}");

        if (response.IsSuccessStatusCode)
        {
            var tokenResponse = JsonSerializer.Deserialize<PayPalTokenResponse>(responseContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
            return tokenResponse?.AccessToken ?? throw new InvalidOperationException("Failed to get access token");
        }

        throw new InvalidOperationException($"Failed to authenticate with PayPal: Status: {response.StatusCode}");
    }

}

// PayPal Response Models with correct JSON property names - Fixed nullable warnings
public class PayPalTokenResponse
{
    [JsonPropertyName("access_token")]
    public required string AccessToken { get; set; }

    [JsonPropertyName("token_type")]
    public required string TokenType { get; set; }

    [JsonPropertyName("expires_in")]
    public int ExpiresIn { get; set; }
}

public class PayPalOrderResponse
{
    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("status")]
    public required string Status { get; set; }

    [JsonPropertyName("links")]
    public required PayPalLink[] Links { get; set; }
}

public class PayPalLink
{
    [JsonPropertyName("href")]
    public required string Href { get; set; }

    [JsonPropertyName("rel")]
    public required string Rel { get; set; }

    [JsonPropertyName("method")]
    public required string Method { get; set; }
}

public class PayPalCaptureResponse
{
    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("status")]
    public required string Status { get; set; }

    [JsonPropertyName("payer")]
    public required PayPalPayer Payer { get; set; }

    [JsonPropertyName("purchase_units")]
    public required PayPalPurchaseUnit[] PurchaseUnits { get; set; }
}

public class PayPalPayer
{
    [JsonPropertyName("email_address")]
    public required string EmailAddress { get; set; }

    [JsonPropertyName("name")]
    public required PayPalName Name { get; set; }
}

public class PayPalName
{
    [JsonPropertyName("given_name")]
    public required string GivenName { get; set; }

    [JsonPropertyName("surname")]
    public required string Surname { get; set; }
}

public class PayPalPurchaseUnit
{
    [JsonPropertyName("payments")]
    public required PayPalPayments Payments { get; set; }
}

public class PayPalPayments
{
    [JsonPropertyName("captures")]
    public required PayPalCapture[] Captures { get; set; }
}

public class PayPalCapture
{
    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("status")]
    public required string Status { get; set; }
}
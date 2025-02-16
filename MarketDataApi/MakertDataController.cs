using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class MarketDataController : ControllerBase
{
    [HttpGet("stream")]
    public async Task GetMarketDataStream()
    {
        Response.ContentType = "text/event-stream";
        var rng = new Random();

        var TOTAL_OPERATIONS = 1000;

        // Continue streaming individual objects
        while (!HttpContext.RequestAborted.IsCancellationRequested)
        {
            // Create an array to hold 5000 objects
            var marketDataArray = new MarketData[TOTAL_OPERATIONS];

            // Generate 5000 objects
            for (int i = 0; i < TOTAL_OPERATIONS; i++)
            {
                marketDataArray[i] = new MarketData
                {
                    Id = Guid.NewGuid(), // Generate a unique ID
                    Symbol = "AAPL",
                    Price = 150 + (decimal)rng.NextDouble() * 10,
                    Timestamp = DateTime.UtcNow
                };
            }

            // Serialize the array to JSON
            var jsonArray = JsonSerializer.Serialize(marketDataArray);

            // Send the array as a single SSE message
            await Response.WriteAsync($"data: {jsonArray}\n\n");
            await Response.Body.FlushAsync();
            await Task.Delay(300, HttpContext.RequestAborted);
        }
    }

    [HttpPost("send")]
    public IActionResult ReceiveMarketData([FromBody] MarketData marketData)
    {
        if (marketData == null)
        {
            return BadRequest("Invalid market data.");
        }

        // Process the received market data
        Console.WriteLine($"Received Market Data: {marketData.Id}, {marketData.Symbol}, {marketData.Price}, {marketData.Timestamp}");

        return Ok(new { Message = "Market data received successfully.", Data = marketData });
    }
}
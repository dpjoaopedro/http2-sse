using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Concurrent;

[ApiController]
[Route("api/[controller]")]
public class MarketDataController : ControllerBase
{
    private static readonly ConcurrentBag<HttpResponse> _activeStreams = new ConcurrentBag<HttpResponse>();
    private readonly Random rng = new Random();

    [HttpGet("stream")]
    public async Task GetMarketDataStream()
    {
        Response.ContentType = "text/event-stream";

        _activeStreams.Add(Response);

        try
        {
            var first = true;
            while (!HttpContext.RequestAborted.IsCancellationRequested)
            {
                
                var TOTAL_OPERATIONS = 1;

                if (first) {
                    TOTAL_OPERATIONS = 50000;
                    first = false;
                }

                var marketDataArray = new MarketData[TOTAL_OPERATIONS];

                for (int i = 0; i < TOTAL_OPERATIONS; i++)
                {
                    marketDataArray[i] = new MarketData
                    {
                        Id = Guid.NewGuid(),
                        Symbol = "AAPL",
                        Price = 1000 + (decimal)rng.NextDouble() * 100000,
                        Timestamp = DateTime.UtcNow
                    };
                }

                var jsonArray = JsonSerializer.Serialize(marketDataArray);
                await Response.WriteAsync($"data:" + "{ \"add\":" + $"{jsonArray}" + "}" + "\n\n");
                await Response.Body.FlushAsync();
                await Task.Delay(100, HttpContext.RequestAborted);
            }
        }
        finally
        {
            _activeStreams.TryTake(out _);
        }
    }

    [HttpPost("update")]
    public async Task<IActionResult> UpdateMarketData([FromBody] UpdateRequest updateRequest)
    {
        if (updateRequest?.MarketData == null)
        {
            return BadRequest("Invalid update request.");
        }

        if (updateRequest.param == "+")
        {
            updateRequest.MarketData.Price += (decimal)rng.NextDouble() * 10;
        }

        if (updateRequest.param == "-")
        {
            updateRequest.MarketData.Price -= (decimal)rng.NextDouble() * 10;

        }

        var jsonUpdate = JsonSerializer.Serialize(updateRequest.MarketData);
        foreach (var response in _activeStreams.ToArray())
        {
            try
            {
                await response.WriteAsync($"data:" + "{ \"update\": [" + $"{jsonUpdate}" + "]}" + "\n\n");
                await response.Body.FlushAsync();
            }
            catch
            {
                // Remove disconnected clients
                _activeStreams.TryTake(out _);
            }
        }

        return Ok(new { Message = "Market data update sent to streams." });
    }

    // Existing ReceiveMarketData method and other code...
}


public class MarketData
{
    public Guid Id { get; set; }
    public string Symbol { get; set; }
    public decimal Price { get; set; }
    public DateTime Timestamp { get; set; }
}

public class UpdateRequest
{
    public MarketData MarketData { get; set; }
    public string param { get; set; }
}
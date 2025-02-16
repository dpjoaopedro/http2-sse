using Microsoft.AspNetCore.Server.Kestrel.Core;

var builder = WebApplication.CreateBuilder(args);

// Add required services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Configure Kestrel for HTTP/2
builder.WebHost.ConfigureKestrel(options =>
{
    options.ConfigureEndpointDefaults(configureOptions =>
    {
        configureOptions.Protocols = HttpProtocols.Http1AndHttp2AndHttp3;
    });
});

var app = builder.Build();

// Middleware pipeline
app.UseHttpsRedirection();
app.UseCors("AllowAngular");
app.UseRouting();
app.UseAuthorization();

app.MapControllers();

app.Run();
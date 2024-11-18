using back;
using back_end;
using back_end.Controllers;
using back_end.Services;

var builder = WebApplication.CreateBuilder(args);

IConfiguration config = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json")
                .AddEnvironmentVariables().Build();

var SERVER_PORT = config.GetValue<int>("SERVER_PORT");
GlobalVars.LIVEKIT_API_KEY = config.GetValue<string>("LIVEKIT_API_KEY");
GlobalVars.LIVEKIT_API_SECRET = config.GetValue<string>("LIVEKIT_API_SECRET");

builder.Services.AddControllers();
builder.Services.AddSingleton<UsersService>(new UsersService());
builder.Services.AddSingleton<RoomsService>(new RoomsService());
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSignalR();
builder.Services.AddSession(options =>
{
    options.Cookie.Name = "MyCoocki";
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
    options.Cookie.SameSite = SameSiteMode.Strict;
    options.Cookie.SecurePolicy = CookieSecurePolicy.None;
});

builder.WebHost.UseKestrel(serverOptions =>
{
    serverOptions.ListenAnyIP(SERVER_PORT);
});

var app = builder.Build();

app.UseCors(builder =>
{
    builder.WithOrigins("http://localhost:3000")
           .AllowAnyMethod()
           .AllowAnyHeader()
           .AllowCredentials();
});

app.UseRouting();
app.UseWebSockets();
app.MapControllers();
app.UseSession();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Main}/{action=Index}/{id?}");


app.UseEndpoints(endpoints =>
{
    endpoints.MapHub<SignalHub>("/signal");
});

app.UseEndpoints(endpoints =>
{
    endpoints.MapControllerRoute(
        name: "profile",
        pattern: "{controller=Home}/{action=Profile}");
    endpoints.MapControllerRoute(
        name: "Login",
        pattern: "{controller=OAuth}/{action=GetUrl}");
    endpoints.MapControllerRoute(
        name: "Register",
        pattern: "{controller=Account}/{action=Code}");
    endpoints.MapControllerRoute(
        name: "CreateRoom",
        pattern: "{controller=VideoStream}/{action=CreateRoom}");
    endpoints.MapControllerRoute(
        name: "isAuthed",
        pattern: "isAuthed",
        defaults: new { controller = "OAuth", action = "isAuthed" });
    endpoints.MapControllerRoute(
        name: "VideoStream",
        pattern: "ws",
        defaults: new { controller = "VideoStream", action = "WebSocketConnection" });
    endpoints.MapControllerRoute(
        name: "token",
        pattern: "token",
        defaults: new { controller = "Rooms", action = "Token" });
    endpoints.MapControllerRoute(
        name: "token",
        pattern: "/livekit/webhook",
        defaults: new { controller = "Rooms", action = "Webhook" });
});

if (GlobalVars.LIVEKIT_API_KEY == null || GlobalVars.LIVEKIT_API_SECRET == null)
{
    Console.Error.WriteLine("\nERROR: LIVEKIT_API_KEY and LIVEKIT_API_SECRET not set\n");
    Environment.Exit(1);
}
if (GlobalVars.LIVEKIT_API_SECRET.Length < 32)
{
    Console.Error.WriteLine("\nERROR: LIVEKIT_API_SECRET must be at least 32 characters long\n");
    Environment.Exit(1);
}

app.Run();

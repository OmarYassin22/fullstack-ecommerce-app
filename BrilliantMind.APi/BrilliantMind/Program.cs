using System.Reflection;
using System.Text;
using BeetElward.Data;
using BeetElward.Helper;
using BeetElward.Interfaces;
using BeetElward.Repo;
using BeetElward.Services;
using FluentValidation;
using FluentValidation.AspNetCore;
using Mapster;
using MapsterMapper;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<ApPDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("RemoteConnection")));
builder.Services.AddIdentity<IdentityUser, IdentityRole>(
    opt =>
    {
        opt.Password.RequireDigit = true;
        opt.Password.RequiredLength = 8;
        opt.Password.RequireLowercase = true;
        opt.Password.RequireUppercase = true;
        opt.Password.RequireNonAlphanumeric = false;
        opt.User.RequireUniqueEmail = true;


    })
    .AddEntityFrameworkStores<ApPDbContext>()
    .AddDefaultTokenProviders();
builder.Services.AddScoped<IBookRepo, BookRepo>();
builder.Services.AddScoped<IUserRepo, UserRepo>();
builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
// Configure Mapster properly
var config = new TypeAdapterConfig();
config.Scan(Assembly.GetExecutingAssembly());
builder.Services.AddSingleton(config);
builder.Services.AddScoped<IMapper, ServiceMapper>();
builder.Services.AddScoped<IImageService, ImageService>();
builder.Services.AddScoped<ICategoryRepo, CategoryRepo>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IOrderRepo, OrderRepo>();

builder.Services.AddCors(opt =>
{
    opt.AddPolicy("AllowAllOrigins", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

// Add these service registrations
builder.Services.AddHttpClient<IPayPalService, PayPalService>();
builder.Services.AddScoped<IPayPalService, PayPalService>();

builder.Services
    .AddFluentValidationAutoValidation()
    .AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

builder.Services.AddAuthentication(opt =>
{
    opt.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    opt.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).
AddJwtBearer(opt =>
{
    opt.TokenValidationParameters = new TokenValidationParameters
    {

        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"],
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ClockSkew = TimeSpan.Zero, // Important: Remove default 5-minute clock skew

        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))

    };

});
builder.Services.AddAuthorization();
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));

var app = builder.Build();


using (var scope = app.Services.CreateScope())
{
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<IdentityUser>>();
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();

    try
    {
        await SeedService.SeedAdminUserAsync(userManager, roleManager);
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while seeding admin user");
    }
}


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
// Add this before app.UseStaticFiles()
//app.UseStaticFiles(new StaticFileOptions
//{
//    FileProvider = new PhysicalFileProvider(Path.Combine(app.Environment.WebRootPath, "pdfs")),
//    RequestPath = "/pdfs",
//    OnPrepareResponse = ctx =>
//    {
//        // Add security headers for PDF files
//        if (ctx.File.Name.EndsWith(".pdf"))
//        {
//            ctx.Context.Response.Headers.Add("X-Content-Type-Options", "nosniff");
//            ctx.Context.Response.Headers.Add("X-Frame-Options", "DENY");
//        }
//    }
//});
//app.UseStaticFiles();
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        ctx.Context.Response.Headers.Add("Access-Control-Allow-Origin", "*");
        ctx.Context.Response.Headers.Add("Access-Control-Allow-Methods", "GET");
        ctx.Context.Response.Headers.Add("Access-Control-Allow-Headers", "*");
    }
});
app.UseHttpsRedirection();

app.MapControllers();

app.UseCors("AllowAllOrigins");

app.Run();

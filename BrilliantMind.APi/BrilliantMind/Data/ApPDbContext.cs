using BrilliantMind.Data.Model;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace BrilliantMind.Data;

public class ApPDbContext(DbContextOptions<ApPDbContext> options) : IdentityDbContext(options)
{
    public DbSet<Book> Books { get; set; }
    public DbSet<UserBooks> UserBooks { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<BookImages> BookImages { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<Payment> Payments { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        // Configure relationships
        builder.Entity<Book>()
            .HasOne(b => b.Category)
            .WithMany(c => c.Books)
            .HasForeignKey(b => b.CategoryId)
            .OnDelete(DeleteBehavior.Restrict); // Prevent cascade delete

        builder.Entity<UserBooks>()
            .HasKey(ub => ub.Id);
        builder.Entity<UserBooks>()
            .HasOne(ub => ub.Book)
            .WithMany(b => b.Users)
            .HasForeignKey(ub => ub.BookId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<IdentityUser>()
            .HasMany<UserBooks>()
            .WithOne(ub => ub.User)
            .HasForeignKey(ub => ub.UserId)
            .OnDelete(DeleteBehavior.SetNull);


        builder.Entity<BookImages>()
            .HasOne(bi => bi.Book)
            .WithMany(b => b.ImageUrls)
            .HasForeignKey(bi => bi.BookId)
            .OnDelete(DeleteBehavior.Cascade); // Allow cascade delete

        builder.Entity<Order>()
            .HasMany(o => o.Books)
            .WithMany()
            .UsingEntity(j => j.ToTable("OrderBooks"));

        // Order relationships
        builder.Entity<Order>()
            .HasOne(o => o.User)
            .WithMany()
            .HasForeignKey(o => o.UserId)
            .OnDelete(DeleteBehavior.Restrict); // Prevent cascade delete

        builder.Entity<Order>()
            .HasOne(o => o.CreatedBy)
            .WithMany()
            .HasForeignKey("CreatedById")
            .OnDelete(DeleteBehavior.Restrict); // Prevent cascade delete

        builder.Entity<Order>()
            .HasOne(o => o.UpdatedBy)
            .WithMany()
            .HasForeignKey("UpdatedById")
            .OnDelete(DeleteBehavior.Restrict); // Prevent cascade delete

        // Payment relationships - THIS IS THE KEY FIX
        builder.Entity<Payment>()
            .HasOne(p => p.Order)
            .WithMany()
            .HasForeignKey(p => p.OrderId)
            .OnDelete(DeleteBehavior.Restrict); // Prevent cascade delete

        builder.Entity<Payment>()
            .HasOne(p => p.User)
            .WithMany()
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Restrict); // Prevent cascade delete

        // Configure indexes for better performance
        builder.Entity<Payment>()
            .HasIndex(p => p.PayPalOrderId)
            .IsUnique()
            .HasFilter("[PayPalOrderId] IS NOT NULL");

        builder.Entity<Payment>()
            .HasIndex(p => p.TransactionId)
            .IsUnique()
            .HasFilter("[TransactionId] IS NOT NULL");

        builder.Entity<Payment>()
            .HasIndex(p => new { p.OrderId, p.Status });

        // Configure decimal precision
        builder.Entity<Payment>()
            .Property(p => p.Amount)
            .HasPrecision(18, 2);

        builder.Entity<Book>()
            .Property(b => b.Price)
            .HasPrecision(18, 2);

        builder.Entity<Book>()
            .Property(b => b.Discount)
            .HasPrecision(18, 2);

        builder.Entity<Order>()
            .Property(o => o.TotalPrice)
            .HasPrecision(18, 2);

        builder.Entity<Category>().HasData(
            new Category { Id = 1, Title = "Math", Description = "Math Categry" },
            new Category { Id = 2, Title = "Learning", Description = "Learning Categry" },
            new Category { Id = 3, Title = "Coloring", Description = "Coloring Categry" },
            new Category { Id = 4, Title = "Stories", Description = "Stories Categry" },
            new Category { Id = 5, Title = "Activities", Description = "Activities Categry" }
        );

        base.OnModelCreating(builder);
    }
}
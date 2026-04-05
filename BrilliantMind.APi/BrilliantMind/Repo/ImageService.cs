using BeetElward.Interfaces;

namespace BeetElward.Services;

public class ImageService : IImageService
{
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<ImageService> _logger;

    public ImageService(IWebHostEnvironment environment, ILogger<ImageService> logger)
    {
        _environment = environment;
        _logger = logger;
    }

    public async Task<string> SaveImageAsync(IFormFile file, string folderName)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("File is empty or null");

        // Validate file type
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();


        if (!allowedExtensions.Contains(extension))
            throw new ArgumentException($"File type {extension} is not allowed");


        // Create folder if it doesn't exist
        string folderBase;
        if (extension == ".pdf")
        {
            folderBase = "pdfs";
        }
        else
        {
            folderBase = "images";
        }
        var uploadsFolder = Path.Combine(_environment.WebRootPath, folderBase.Trim(), folderName.Trim());
        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        // Generate unique filename with GUID
        var uniqueFileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(uploadsFolder.Trim(), uniqueFileName.Trim());

        try
        {
            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(fileStream);
            }

            // Return relative path for database storage
            return Path.Combine(folderName, uniqueFileName).Replace("\\", "/");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving file {FileName}", file.FileName);
            throw new InvalidOperationException("Failed to save file", ex);
        }
    }

    public async Task<IEnumerable<string>> SaveImagesAsync(IEnumerable<IFormFile> files, string folderName = "images")
    {
        var savedFiles = new List<string>();

        foreach (var file in files)
        {
            if (file != null && file.Length > 0)
            {
                var savedPath = await SaveImageAsync(file, folderName);
                savedFiles.Add(savedPath);
            }
        }

        return savedFiles;
    }

    public async Task<bool> DeleteImageAsync(string imagePath)
    {
        try
        {
            string baseFolder;
            if (imagePath.Contains(".pdf"))
                baseFolder = "pdfs";
            else
                baseFolder = "images";

            var fullPath = Path.Combine(_environment.WebRootPath, baseFolder, imagePath.Replace("/", "\\"));

            if (File.Exists(fullPath))
            {
                await Task.Run(() => File.Delete(fullPath));
                return true;
            }

            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting file {ImagePath}", imagePath);
            return false;
        }
    }

    public string GetFileUrl(string imagePath)
    {
        if (string.IsNullOrWhiteSpace(imagePath))
            return "";

        // Clean the path and encode for URL
        var cleanPath = imagePath.Trim().Replace("\\", "/");
        var encodedPath = Uri.EscapeDataString(cleanPath).Replace("%2F", "/");

        if (imagePath.Contains(".pdf"))
            return $"/pdfs/{encodedPath}";

        return $"/images/{encodedPath}";
    }
}
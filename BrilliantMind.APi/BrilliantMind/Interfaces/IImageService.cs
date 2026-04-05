namespace BrilliantMind.Interfaces;

public interface IImageService
{
    Task<string> SaveImageAsync(IFormFile file, string folderName = "images");
    Task<IEnumerable<string>> SaveImagesAsync(IEnumerable<IFormFile> files, string folderName = "images");
    Task<bool> DeleteImageAsync(string imagePath);
    string GetFileUrl(string imagePath);
}
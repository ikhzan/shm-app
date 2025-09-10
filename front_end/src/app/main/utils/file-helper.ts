export class FileHelper {
  static allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  static maxSizeMB = 5;

  static isSafeImage(file: File): boolean {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const mime = file.type;

    return (
      this.allowedTypes.includes(mime) &&
      file.size <= this.maxSizeMB * 1024 * 1024 &&
      ext !== undefined &&
      ['jpg', 'jpeg', 'png', 'gif'].includes(ext) &&
      !/\.(exe|bat|cmd|sh)$/i.test(file.name)
    );
  }

  static getFileExtension(file: File): string | null {
    return file.name.split('.').pop()?.toLowerCase() || null;
  }

  static getReadableSize(file: File): string {
    const sizeMB = file.size / (1024 * 1024);
    return `${sizeMB.toFixed(2)} MB`;
  }

  static isImage(file: File): boolean {
    return file.type.startsWith('image/');
  }

  static previewImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject('Failed to read file');
      reader.readAsDataURL(file);
    });
  }
}
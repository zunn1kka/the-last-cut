import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { promises as fs } from 'fs';
import { extname, join } from 'path';
import { FileType } from 'src/lib/common/enums/type-file.enum';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileService {
  private useCloudinary: boolean;

  constructor(private configService: ConfigService) {
    this.useCloudinary = !!this.configService.get('CLOUDINARY_CLOUD_NAME');

    if (this.useCloudinary) {
      cloudinary.config({
        cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
        api_key: this.configService.get('CLOUDINARY_API_KEY'),
        api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
      });
      console.log('✅ Cloudinary configured');
    } else {
      console.log('📁 Using local file storage');
    }
  }

  async saveFile(
    file: Express.Multer.File,
    type: FileType,
  ): Promise<{ url: string; path: string; publicId?: string }> {
    const folder = this.getFolderByType(type);

    if (this.useCloudinary) {
      const result = await this.uploadToCloudinary(file, folder);
      return {
        url: result.url,
        path: result.publicId,
        publicId: result.publicId,
      };
    }

    // Локальное сохранение (fallback)
    const fileExt = extname(file.originalname);
    const fileName = `${uuidv4()}${fileExt}`;
    const uploadPath = join(process.cwd(), 'uploads', folder);
    const filePath = join(uploadPath, fileName);
    const fileUrl = `/uploads/${folder}/${fileName}`;

    await fs.mkdir(uploadPath, { recursive: true });
    await fs.writeFile(filePath, file.buffer);

    return { url: fileUrl, path: filePath };
  }

  async deleteFile(filePathOrPublicId: string): Promise<void> {
    if (!filePathOrPublicId) return;

    if (this.useCloudinary) {
      // Если это publicId из Cloudinary
      if (!filePathOrPublicId.startsWith('/uploads/')) {
        await cloudinary.uploader.destroy(filePathOrPublicId);
        return;
      }
      // Если это старый URL, пытаемся извлечь publicId
      const publicId = this.extractPublicIdFromUrl(filePathOrPublicId);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
        return;
      }
    }

    // Локальное удаление
    const relativePath = filePathOrPublicId.replace('/uploads/', '');
    const fullPath = join(process.cwd(), 'uploads', relativePath);
    try {
      await fs.unlink(fullPath);
    } catch (error) {
      console.error(`Невозможно удалить файл ${fullPath}:`, error);
    }
  }

  private async uploadToCloudinary(
    file: Express.Multer.File,
    folder: string,
  ): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            });
          }
        },
      );

      const Readable = require('stream').Readable;
      const readableStream = new Readable();
      readableStream.push(file.buffer);
      readableStream.push(null);
      readableStream.pipe(uploadStream);
    });
  }

  private extractPublicIdFromUrl(url: string): string | null {
    // Cloudinary URL: https://res.cloudinary.com/.../upload/v123456/folder/image.jpg
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
    return match ? match[1] : null;
  }

  private getFolderByType(type: FileType): string {
    switch (type) {
      case FileType.AVATAR:
        return 'avatars';
      case FileType.POSTER:
        return 'posters';
      case FileType.BACKDROP:
        return 'backdrops';
      case FileType.PERSON_PHOTO:
        return 'persons';
      default:
        return 'others';
    }
  }

  getFileType(fieldname: string): FileType {
    const lower = fieldname.toLowerCase();

    if (lower.includes('avatar')) return FileType.AVATAR;
    if (lower.includes('poster')) return FileType.POSTER;
    if (lower.includes('backdrop')) return FileType.BACKDROP;
    if (lower.includes('personphoto')) return FileType.PERSON_PHOTO;

    return FileType.AVATAR;
  }
}

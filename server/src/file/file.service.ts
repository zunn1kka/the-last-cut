import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { extname, join } from 'path';
import { FileType } from 'src/lib/common/enums/type-file.enum';
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class FileService {
  async saveFile(
    file: Express.Multer.File,
    type: FileType,
  ): Promise<{ url: string; path: string }> {
    const fileExt = extname(file.originalname);
    const fileName = `${uuidv4()}${fileExt}`;
    const folder = type;

    const uploadPath = join(process.cwd(), 'uploads', folder);
    const filePath = join(uploadPath, fileName);
    const fileUrl = `/uploads/${folder}/${fileName}`;

    await fs.mkdir(uploadPath, { recursive: true });

    await fs.writeFile(filePath, file.buffer);

    return { url: fileUrl, path: filePath };
  }

  async deleteFile(filePath: string): Promise<void> {
    if (!filePath || !filePath.startsWith('/uploads/')) return;

    const relativePath = filePath.replace('/uploads/', '');
    const fullPath = join(process.cwd(), 'uploads', relativePath);

    try {
      await fs.unlink(fullPath);
    } catch (error) {
      console.error(`Невозможно удалить файл ${fullPath}:`, error);
    }
  }

  getFileType(fieldname: string): FileType {
    const lower = fieldname.toLowerCase();

    if (lower.includes('avatar')) return FileType.AVATAR;
    if (lower.includes('poster')) return FileType.POSTER;
    if (lower.includes('backdrop')) return FileType.BACKDROP;
    if (lower.includes('personPhoto')) return FileType.PERSON_PHOTO;

    return FileType.AVATAR;
  }
}

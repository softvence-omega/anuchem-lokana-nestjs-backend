import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

export interface LocalUploadResponse {
  filename: string;
  path: string;
  secure_url: string;
}

@Injectable()
export class CloudinaryService {
  private readonly uploadRoot = path.join(
    __dirname,
    '..',
    '..',
    '..',
    'uploads',
  );

  constructor() {
    if (!fs.existsSync(this.uploadRoot)) {
      fs.mkdirSync(this.uploadRoot, { recursive: true });
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder = 'nest_uploads',
  ): Promise<LocalUploadResponse> {
    let finalFileName;
    let fullPath;
    try {
      const cleanedName = file.originalname.replace(/\s+/g, '_');
      const folderPath = path.join(this.uploadRoot, folder);

      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      const timestamp = Date.now();
      finalFileName = `${timestamp}_${cleanedName}`;
      fullPath = path.join(folderPath, finalFileName);

      await writeFile(fullPath, file.buffer);
    } catch (error) {
      console.log(error);
    }

    return {
      filename: finalFileName,
      path: fullPath,
      secure_url: `/uploads/${folder}/${finalFileName}`,
    };
  }

  async destroyFile(relativePath: string): Promise<void> {
    const filePath = path.join(this.uploadRoot, relativePath);
    if (fs.existsSync(filePath)) {
      await unlink(filePath);
    }
  }

  extractPublicId(url: string): string {
    return url.replace('/uploads/', '');
  }
}

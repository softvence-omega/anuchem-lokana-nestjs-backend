import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse, DeleteApiResponse } from 'cloudinary';
import { Injectable } from '@nestjs/common';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
    constructor(private configService: ConfigService) {
        cloudinary.config({
            cloud_name: this.configService.get<string>('CLOUD_NAME'),
            api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
            api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
        });
    }

    async uploadFile(file: Express.Multer.File, folder = 'nest_uploads'): Promise<UploadApiResponse> {
        const originalName = file.originalname;
        const publicId = originalName.replace(/\s+/g, '_');
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder,
                    public_id: publicId,
                    resource_type: 'raw',
                    use_filename: true
                },
                (error, result) => {
                    if (error) return reject(error);
                    if (!result) return reject(new Error('No result returned from Cloudinary.'));
                    resolve(result as UploadApiResponse);
                }
            );

            Readable.from(file.buffer).pipe(uploadStream);
        });
    }

    async destroyFile(publicId: string): Promise<DeleteApiResponse> {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.destroy(publicId, { resource_type: 'raw' }, (error, result) => {
                if (error) return reject(error);
                resolve(result as DeleteApiResponse);
            });
        });
    }

    extractPublicId(url: string): string {
        const parts = url.split('/upload/');
        if (parts.length < 2) return '';
        const publicIdWithVersion = parts[1];
        const segments = publicIdWithVersion.split('/');
        segments.shift(); // remove version (e.g. v1749358152)
        const publicId = decodeURIComponent(segments.join('/'));
        return publicId;
    }

}

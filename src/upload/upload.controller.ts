import {
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { UploadService } from './upload.service';
import { ImageResize } from 'src/configs/image-resize';
import * as fs from 'fs';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { dest: './localUploads' }))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    try {
      const _type = file.mimetype;
      if (
        !_type.includes('jpeg') &&
        !_type.includes('png') &&
        !_type.includes('jpg')
      ) {
        fs.unlink(file.path, (error) => {
          if (error) {
            return console.log(error);
          }
        });
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_ACCEPTABLE,
            error: 'Invalid image.',
            message: 'Accepted types are jpeg and png.',
          },
          HttpStatus.NOT_ACCEPTABLE,
        );
      }
      if (file.size > 10000000) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_ACCEPTABLE,
            error: 'The image is too large',
            message: 'Image should be less than 10MB',
          },
          HttpStatus.NOT_ACCEPTABLE,
        );
      }
      const image = file.path;
      const result = new ImageResize().resizeImage(image, 480, 640);
      return {
        statausCode: HttpStatus.CREATED,
        message: 'Image uploaded successfully',
        data: await result,
      };
    } catch (error) {
      if (error.message.includes('unsupported image format')) {
        fs.unlink(file.path, (error) => {
          if (error) {
            return console.log(error);
          }
        });
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'This is not a valid image',
            error: await error.message,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      fs.unlink(file.path, (error) => {
        if (error) {
          return console.log(error);
        }
      });
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
          error: await error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('uploads')
  @UseInterceptors(FilesInterceptor('files', 100, { dest: './localUploads' }))
  uploadFiles(@UploadedFiles() files: Array<Express.Multer.File>) {
    console.log(files);
  }
}

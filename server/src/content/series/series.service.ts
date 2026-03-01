import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentType } from 'generated/prisma/enums';
import { FileService } from 'src/file/file.service';
import { FileType } from 'src/lib/common/enums/type-file.enum';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SeriesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly fileService: FileService,
  ) {}

  async uploadPoster(
    contentId: string,
    posterFile: Express.Multer.File,
    userId: string,
  ) {
    const content = await this.prismaService.content.findUnique({
      where: {
        id: contentId,
        contentType: ContentType.SERIES,
      },
    });

    if (!content) {
      throw new NotFoundException('Сериал не найден');
    }

    const poster = await this.fileService.saveFile(posterFile, FileType.POSTER);

    if (content.posterUrl) {
      await this.fileService.deleteFile(content.posterUrl);
    }

    return this.prismaService.content.update({
      where: { id: contentId },
      data: { posterUrl: poster.url },
      include: {
        series: true,
        genres: { include: { genre: true } },
        persons: {
          include: {
            person: true,
            role: true,
          },
        },
      },
    });
  }

  async uploadBackdrop(
    contentId: string,
    backdropFile: Express.Multer.File,
    userId: string,
  ) {
    const content = await this.prismaService.content.findUnique({
      where: {
        id: contentId,
        contentType: ContentType.SERIES,
      },
    });

    if (!content) {
      throw new NotFoundException('Сериал не найден');
    }

    const backdrop = await this.fileService.saveFile(
      backdropFile,
      FileType.BACKDROP,
    );

    if (content.backdropUrl) {
      await this.fileService.deleteFile(content.backdropUrl);
    }

    return this.prismaService.content.update({
      where: { id: contentId },
      data: { backdropUrl: backdrop.url },
      include: {
        series: true,
        genres: { include: { genre: true } },
        persons: {
          include: {
            person: true,
            role: true,
          },
        },
      },
    });
  }

  async uploadImages(
    contentId: string,
    userId: string,
    posterFile?: Express.Multer.File,
    backdropFile?: Express.Multer.File,
  ) {
    return this.prismaService.$transaction(async (tx) => {
      const content = await tx.content.findUnique({
        where: {
          id: contentId,
          contentType: ContentType.SERIES,
        },
      });

      if (!content) {
        throw new NotFoundException('Сериал не найден');
      }

      let posterUrl = content.posterUrl;
      let backdropUrl = content.backdropUrl;

      if (posterFile) {
        if (posterUrl) {
          await this.fileService.deleteFile(posterUrl);
        }
        const poster = await this.fileService.saveFile(
          posterFile,
          FileType.POSTER,
        );
        posterUrl = poster.url;
      }

      if (backdropFile) {
        if (backdropUrl) {
          await this.fileService.deleteFile(backdropUrl);
        }
        const backdrop = await this.fileService.saveFile(
          backdropFile,
          FileType.BACKDROP,
        );
        backdropUrl = backdrop.url;
      }

      return tx.content.update({
        where: { id: contentId },
        data: {
          posterUrl,
          backdropUrl,
        },
        include: {
          series: true,
          genres: { include: { genre: true } },
          persons: {
            include: {
              person: true,
              role: true,
            },
          },
        },
      });
    });
  }
}

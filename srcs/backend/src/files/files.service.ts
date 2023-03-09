import { Injectable } from '@nestjs/common';
import { Buffer } from 'node:buffer'
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class FilesService {
    async downlaodFile(savePath: string, url: string, headers: HeadersInit = {}): Promise<string | null> {
		const httpResponse = await fetch(url, {
			headers: headers
		});

		if (httpResponse.status != 200)
			return null;

		const fileName = this.getFileNameFromPath(httpResponse.url);
		const fileContents = await httpResponse.arrayBuffer();
		const newSavePath = join(savePath, fileName);

		try {
			fs.writeFileSync(newSavePath, Buffer.from(fileContents));
		} catch(e) {
			return null;
		}

		return newSavePath;
	}

	deleteFile(filePath: string): boolean {
		if (filePath)
		try {
			fs.unlinkSync(filePath);
			return true;
		} catch(e) {
			return false;
		}
	}

	getFileNameFromPath(path: string): string {
        if (!path)
            return null;
		return path.split('/').pop();
	}

    async pixelizeUserImage(imagePath: string, username: string): Promise<string> {
		const file = fs.readFileSync(imagePath);
		const formData: FormData = new FormData();
		formData.append("file", new Blob([file]), "file");

		let httpResponse = await fetch("http://pixelizer:3001/pixelizer", {
			method: "POST",
			body: formData
		})

		if (httpResponse.status != 200)
			return null;

		const fileContents = await httpResponse.arrayBuffer();
		const savePath = join(process.cwd(), "avatars", `${username}.jpg`);

		try {
			fs.writeFileSync(savePath, Buffer.from(fileContents));
		} catch(e) {
			return null;
		}

		return savePath;
	}

	uploadFile(savePath: string, file: Express.Multer.File): boolean {
		const fileBuffer: Buffer = file.buffer;
		try {
			fs.writeFileSync(savePath, fileBuffer);
			return true;
		} catch(e) {
			return false;
		}
	}
}

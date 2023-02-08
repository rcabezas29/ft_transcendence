import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createWriteStream, writeFile, WriteFileOptions, WriteStream } from 'fs';
import { join } from 'path';
import * as fs from 'fs';

@Injectable()
export class IntraAuthService {
    private _appIntraToken: string;

    constructor() {
        this.authorizeIntraApp();
    }

    get appIntraToken(): string {
        return this._appIntraToken;
    }

    async usernameExistsInIntra(username: string): Promise<boolean> {
        const httpResponse = await fetch(`https://api.intra.42.fr/v2/users/${username}`, {
            headers: {"Authorization": `Bearer ${this._appIntraToken}`}
        });
        if (httpResponse.status === 200)
            return true;
        return false;
    }

    async getUserIntraToken(code: string, state: string) {
        if (state != process.env.STATE_STRING)
            throw new UnauthorizedException('state strings do not match');

        const postBody = {
            grant_type: 'authorization_code',
            client_id: process.env.INTRA_API_UID,
            client_secret: process.env.INTRA_API_SECRET,
            code: code,
            redirect_uri: 'http://localhost:5173/oauth',
            state: process.env.STATE_STRING
        };

        const httpResponse = await fetch('https://api.intra.42.fr/oauth/token', {
        method: "POST",
        body: JSON.stringify(postBody),
        headers: {"content-type": "application/json"}
        });
        const response = await httpResponse.json();

        if (httpResponse.status != 200)
            throw new UnauthorizedException(response);

        const token = response.access_token;
        return token;
    }

    async getUserInfo(token: string) {
        const httpResponse = await fetch("https://api.intra.42.fr/v2/me", {
            headers: {"Authorization": `Bearer ${token}`}
        });
        const response = await httpResponse.json();
        if (httpResponse.status != 200)
            throw new UnauthorizedException(response);
    
        const userEmail = response.email;
        const username = response.login;
		const userImageURL = response.image.link;
        
        return { email: userEmail, username, userImageURL };
    }

    private async authorizeIntraApp(): Promise<void> {
        const postBody = {
            grant_type: 'client_credentials',
            client_id: process.env.INTRA_API_UID,
            client_secret: process.env.INTRA_API_SECRET,
        };

        const httpResponse = await fetch("https://api.intra.42.fr/oauth/token", {
            method: "POST",
            body: JSON.stringify(postBody),
            headers: {"content-type": "application/json"}
        });
        const response = await httpResponse.json();
        if (httpResponse.status != 200)
		    throw new UnauthorizedException(response);
       
        this._appIntraToken = response.access_token;
    }
	
	async downlaodFile(savePath: string, url: string, headers: HeadersInit = {}): Promise<string | null> {
		const httpResponse = await fetch(url, {
			headers: headers
		});

		if (httpResponse.status != 200)
			return null;

		const fileName = httpResponse.url.split('/').pop();
		const fileContents = await httpResponse.arrayBuffer();
		const newSavePath = join(savePath, fileName);

		fs.writeFileSync(newSavePath, Buffer.from(fileContents));

		return newSavePath;
	}

	deleteFile(filePath: string) {
		fs.unlinkSync(filePath);
	}

	getFileNameFromPath(path: string): string {
		return path.split('/').pop();
	}

	async downloadIntraImage(userImageURL: string) {
		const savePath = join(process.cwd(), "intra-images");
		const downloadedFilePath = await this.downlaodFile(
			savePath,
			userImageURL, 
			{"Authorization": `Bearer ${this._appIntraToken}`}
		);

		return downloadedFilePath;
	}

	async pixelizeUserImage(imagePath: string, username: string): Promise<string> {
		const file = fs.readFileSync(imagePath);
		const formData: FormData = new FormData();
		formData.append("file", new Blob([file]), "file");

		let httpResponse = await fetch("http://pixelizer:3001/pixelizer", {
			method: "POST",
			body: formData
		})

		console.log(httpResponse.status);
		if (httpResponse.status != 200)
			return null;

		const fileContents = await httpResponse.arrayBuffer();
		const savePath = join(process.cwd(), "avatars", `${username}.jpg`);
		fs.writeFileSync(savePath, Buffer.from(fileContents));
		return savePath;
	}
}

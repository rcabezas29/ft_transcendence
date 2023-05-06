import { Injectable, UnauthorizedException } from '@nestjs/common';
import { join } from 'path';
import { FilesService } from 'src/files/files.service';

@Injectable()
export class IntraAuthService {
    private _appIntraToken: string;

    constructor(
        private readonly filesService: FilesService
    ) {
        this.authorizeIntraApp();
    }

    get appIntraToken(): string {
        return this._appIntraToken;
    }

    async getUserIntraToken(code: string, state: string) {
        if (state != process.env.STATE_STRING)
            throw new UnauthorizedException('state strings do not match');

        const postBody = {
            grant_type: 'authorization_code',
            client_id: process.env.INTRA_API_UID,
            client_secret: process.env.INTRA_API_SECRET,
            code: code,
            redirect_uri: `${process.env.FRONTEND_URL}/oauth`,
            state: process.env.STATE_STRING
        };

        const httpResponse = await fetch('https://api.intra.42.fr/oauth/token', {
        method: "POST",
        body: JSON.stringify(postBody),
        headers: {"content-type": "application/json"}
        });

        if (httpResponse.status != 200)
            throw new UnauthorizedException("error while getting user's intra token");
        
        const response = await httpResponse.json();

        const token = response.access_token;
        return token;
    }

    async getUserInfo(token: string) {
        const httpResponse = await fetch("https://api.intra.42.fr/v2/me", {
            headers: {"Authorization": `Bearer ${token}`}
        });
        if (httpResponse.status != 200)
            throw new UnauthorizedException("error while getting user's info from the intra");
        
        const response = await httpResponse.json();
    
        const userEmail = response.email;
        const intraUsername = response.login;
		const userImageURL = response.image.link;
        
        return { email: userEmail, intraUsername, userImageURL };
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
        if (httpResponse.status != 200)
		    throw new UnauthorizedException("error in client credentials flow while authorizing intra app");
    
        const response = await httpResponse.json();        
       
        this._appIntraToken = response.access_token;
    }

	async downloadIntraImage(userImageURL: string): Promise<string | null> {
		const savePath = join(process.cwd(), "intra-images");
		const downloadedFilePath = await this.filesService.downlaodFile(
			savePath,
			userImageURL, 
			{"Authorization": `Bearer ${this._appIntraToken}`}
		);

		return downloadedFilePath;
	}

}

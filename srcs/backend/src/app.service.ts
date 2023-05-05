import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { SeedService } from "./seed/seed.service";

@Injectable()
export class AppService implements OnApplicationBootstrap {
	constructor(
		private seedService: SeedService
	) {}

	onApplicationBootstrap(): any {
		console.log("executing seed...");
		this.seedService.runSeed().then((res) => console.log(res));
	}
}
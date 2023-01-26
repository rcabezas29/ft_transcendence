import { Injectable } from "@nestjs/common";
import { GatewayUser } from "src/gateway-manager/interfaces/gateway-user.interface";
import Channel from "./channel.class";

@Injectable()
export class ChannelsService {
	
	private channels: Channel[];

	createChannel(channelName: string, owner: GatewayUser): void {
		this.channels.push(new Channel(channelName, owner));
	}

}
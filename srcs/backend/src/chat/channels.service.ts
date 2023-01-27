import { Injectable } from "@nestjs/common";
import { GatewayUser } from "src/gateway-manager/interfaces/gateway-user.interface";
import Channel from "./channel.class";
import { ChannelMessagePayload } from "./interfaces/message-payload.interface";

@Injectable()
export class ChannelsService {
	
	private channels: Channel[] = [];

	createChannel(channelName: string, owner: GatewayUser): void {
		this.channels.push(new Channel(channelName, owner));
		owner.socket.join(channelName);
		owner.socket.emit('channel-created', channelName);
	}

	getChannel(channelName: string) {
		return this.channels.find((channel) => channel.name == channelName);
	}

	channelMessage(user: GatewayUser, payload: ChannelMessagePayload) {
		const channel: Channel = this.getChannel(payload.channel);

		//TODO: Check if user is muted
		//if muted, notify the user

		const channelHasUser = channel.hasUser(user);
		if (!channelHasUser)
			return ;

		payload.from = user.username;
		
		user.socket.to(payload.channel).emit("channel-message", payload)
	}

}
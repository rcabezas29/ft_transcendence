import { ChannelPayload } from "./channel-payload.interface";
import { ChatUser } from "./chat-user.interface";

export interface UserChannelNamePayload {
	user: ChatUser,
	channelName: string
}

export interface UserIdChannelPayload {
	userId: number,
	channel: ChannelPayload
}

export interface UserArrayChannelPayload {
	users: ChatUser[],
	channelName: string
}

import { ChatUser } from "./chat-user.interface";

export interface UserChannelPayload {
	user: ChatUser,
	channelName: string
}

export interface UserArrayChannelPayload {
	users: ChatUser[],
	channelName: string
}

import { ChatUser } from "./chat-user.interface";

export interface TimeUserChannelPayload {
	user: ChatUser,
	time: number,
	channelName: string
}

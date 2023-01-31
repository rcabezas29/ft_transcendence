import { ChatUser } from "./chat-user.interface";

export interface UserChannelPayload {
	user: ChatUser,
	channelName: string
}

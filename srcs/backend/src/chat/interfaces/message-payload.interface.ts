import { ChatUser } from "./chat-user.interface";

export interface DirectMessagePayload {
    friendId: number;
    message: string;
}

export interface ChannelMessagePayload {
	channel: string;
	from: ChatUser;
	message: string;
}

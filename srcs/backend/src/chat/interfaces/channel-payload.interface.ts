import { ChatUser } from "./chat-user.interface";
import { Message } from "./message.interface";

export interface ChannelPayload {
	name: string;
	users: ChatUser[];
	owner: ChatUser;
	admins: ChatUser[];
	isPrivate: boolean;
	messages: Message[];
}

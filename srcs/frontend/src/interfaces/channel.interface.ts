import type { ChatUser } from "./chat-user.interface";
import type { Chat } from "./chat.interface";

export interface Channel {
	name: string;
	users: ChatUser[];
	owner: ChatUser;
	admins: ChatUser[];
	chat: Chat | null;
	isPrivate: boolean;
}

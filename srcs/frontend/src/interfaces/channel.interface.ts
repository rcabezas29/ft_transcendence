import type { ChatUser } from "./chat-user.interface";

export interface Channel {
	name: string;
	users: ChatUser[];
}

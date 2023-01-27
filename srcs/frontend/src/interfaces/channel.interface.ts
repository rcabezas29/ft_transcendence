import type { ChatUser } from "./chat-user.interface";

export interface Channel {
	name: string;
	users: ChatUser[];
	owner: ChatUser;
	admins: ChatUser[];
	password: string;
}

import type { ChatUser } from "./chat-user.interface";

export interface Message {
	from: ChatUser;
	message: string;
}

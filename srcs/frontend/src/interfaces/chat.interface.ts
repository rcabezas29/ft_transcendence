import type { ChatUser } from "./chat-user.interface";
import type { Message } from "./message.interface";

export interface Chat {
    messages: Message[];
    notification: boolean;
	target: ChatUser | string;
}
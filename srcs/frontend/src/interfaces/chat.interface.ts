import type { ChatUser } from "./friend.interface";
import type { Message } from "./message.interface";

export interface Chat {
    messages: Message[];
    notification: boolean;
	target: ChatUser | string;
}
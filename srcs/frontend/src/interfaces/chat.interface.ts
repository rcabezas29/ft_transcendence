import type { Friend } from "./friend.interface";
import type { Message } from "./message.interface";

export interface Chat {
    messages: Message[];
    notification: boolean;
	target: Friend | string;
}
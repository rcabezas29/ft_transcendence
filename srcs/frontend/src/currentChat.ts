import { ref, type Ref } from "vue";
import type { Chat } from './interfaces';

export function chatIsChannel(chat: Chat): boolean {
	return (typeof chat.target == "string"); 
}

export function chatIsDirectMessage(chat: Chat): boolean {
	return (typeof chat.target == "object"); 
}

export const currentChat: Ref<Chat | null> = ref<Chat | null>(null);
import type { ChatUser } from "./chat-user.interface";
import type { Message } from "./message.interface";

export enum ChallengeState {
    None,
    Challenged,
    Challenger
}

export interface Chat {
    messages: Message[];
    notification: boolean;
    challenge: ChallengeState;
	target: ChatUser | string;
}
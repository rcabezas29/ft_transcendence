export interface MessagePayload {
    friendId: number;
    message: string;
}

export interface ChannelMessagePayload {
	channel: string;
	from: string;
	message: string;
}

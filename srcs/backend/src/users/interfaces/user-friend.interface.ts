export enum FrontendFriendshipStatus {
	RequestSent = 0,
    RequestReceived = 1,
    Active = 2,
    Blocked = 3,
}

export interface UserFriend {
	userId: number,
	username: string,
    friendshipId: number;
	friendshipStatus: FrontendFriendshipStatus
}

import * as bcrypt from 'bcrypt';
import { FriendshipStatus } from 'src/friendships/entities/friendship.entity';

interface SeedUser {
    email: string;
    username: string;
    password: string;
	avatar: string;
}

interface SeedFriendship {
	user1: string;
	user2: string;
	status: FriendshipStatus;
}

interface SeedData {
    users: SeedUser[];
	friendships: SeedFriendship[];
}

export const initialData: SeedData = {
    users: [
        {
            email: 'user1@example.com',
            username: 'user1',
			avatar: "default_avatar.jpg",
            password: bcrypt.hashSync('1234', 10),
        },
        {
            email: 'user2@example.com',
            username: 'user2',
			avatar: "default_avatar.jpg",
            password: bcrypt.hashSync('1234', 10),
        },
        {
            email: 'user3@example.com',
            username: 'user3',
			avatar: "default_avatar.jpg",
            password: bcrypt.hashSync('1234', 10),
        },
        {
            email: 'user4@example.com',
            username: 'user4',
			avatar: "default_avatar.jpg",
            password: bcrypt.hashSync('1234', 10),
        },
		{
            email: 'user5@example.com',
            username: 'user5',
			avatar: "default_avatar.jpg",
            password: bcrypt.hashSync('1234', 10),
        },
    ],
	friendships: [
		{
			user1: 'user1',
			user2: 'user2',
			status: FriendshipStatus.Active
		},
		{
			user1: 'user1',
			user2: 'user3',
			status: FriendshipStatus.Pending
		},
		{
			user1: 'user1',
			user2: 'user4',
			status: FriendshipStatus.Blocked
		},
		{
			user1: 'user5',
			user2: 'user1',
			status: FriendshipStatus.Active
		},
		{
			user1: 'user2',
			user2: 'user3',
			status: FriendshipStatus.Active
		},
		{
			user1: 'user2',
			user2: 'user4',
			status: FriendshipStatus.Pending
		},
		{
			user1: 'user5',
			user2: 'user3',
			status: FriendshipStatus.Blocked
		},
	]
}
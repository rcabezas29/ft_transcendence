import * as bcrypt from 'bcrypt';
import { FriendshipStatus } from 'src/friends/entities/friend.entity';

interface SeedUser {
    email: string;
    username: string;
    password: string;
    //roles: string[];
}

interface SeedFriend {
	user1: string;
	user2: string;
	status: FriendshipStatus;
}

interface SeedData {
    users: SeedUser[];
	friends: SeedFriend[];
}

export const initialData: SeedData = {
    users: [
        {
            email: 'user1@example.com',
            username: 'user1',
            password: '1234',
            //password: bcrypt.hashSync('Abc123', 10),
            //roles: ['admin']
        },
        {
            email: 'user2@example.com',
            username: 'user2',
            password: '1234',
            //password: bcrypt.hashSync('Abc123', 10),
            //roles: ['admin']
        },
        {
            email: 'user3@example.com',
            username: 'user3',
            password: '1234',
            //password: bcrypt.hashSync('Abc123', 10),
            //roles: ['admin']
        },
        {
            email: 'user4@example.com',
            username: 'user4',
            password: '1234',
            //password: bcrypt.hashSync('Abc123', 10),
            //roles: ['admin']
        },
		{
            email: 'user5@example.com',
            username: 'user5',
            password: '1234',
            //password: bcrypt.hashSync('Abc123', 10),
            //roles: ['admin']
        },
    ],
	friends: [
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
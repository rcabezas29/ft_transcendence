import * as bcrypt from 'bcrypt';
import { FriendshipStatus } from 'src/friendships/entities/friendship.entity';
import { UserRole } from 'src/users/interfaces/user-roles';

interface SeedUser {
    email: string;
    username: string;
    password: string;
	avatar: string;
	role?: UserRole;
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
            email: 'owner@admin.com',
            username: 'owner',
			avatar: "default_avatar.jpg",
            password: bcrypt.hashSync('1234', 10),
			role: UserRole.OWNER
        },
		{
            email: 'eustaquio@admin.com',
            username: 'eustaquio',
			avatar: "default_avatar.jpg",
            password: bcrypt.hashSync('1234', 10),
			role: UserRole.ADMIN
        },
        {
            email: 'pepe@example.com',
            username: 'pepitogrill0',
			avatar: "default_avatar.jpg",
            password: bcrypt.hashSync('1234', 10),
        },
        {
            email: 'maria@example.com',
            username: 'maria',
			avatar: "default_avatar.jpg",
            password: bcrypt.hashSync('1234', 10),
        },
        {
            email: 'juan@example.com',
            username: 'juan',
			avatar: "default_avatar.jpg",
            password: bcrypt.hashSync('1234', 10),
        },
        {
            email: 'lola@example.com',
            username: 'lola',
			avatar: "default_avatar.jpg",
            password: bcrypt.hashSync('1234', 10),
        },
		{
            email: 'john@example.com',
            username: 'john',
			avatar: "default_avatar.jpg",
            password: bcrypt.hashSync('1234', 10),
        },
    ],
	friendships: [
		{
			user1: 'owner',
			user2: 'pepitogrill0',
			status: FriendshipStatus.Active
		},
		{
			user1: 'owner',
			user2: 'eustaquio',
			status: FriendshipStatus.Active
		},
		{
			user1: 'owner',
			user2: 'maria',
			status: FriendshipStatus.Pending
		},
		{
			user1: 'owner',
			user2: 'juan',
			status: FriendshipStatus.Blocked
		},
		{
			user1: 'lola',
			user2: 'owner',
			status: FriendshipStatus.Active
		},
		{
			user1: 'pepitogrill0',
			user2: 'maria',
			status: FriendshipStatus.Active
		},
		{
			user1: 'pepitogrill0',
			user2: 'juan',
			status: FriendshipStatus.Pending
		},
		{
			user1: 'lola',
			user2: 'maria',
			status: FriendshipStatus.Blocked
		},
		{
			user1: 'lola',
			user2: 'john',
			status: FriendshipStatus.Active
		},
		{
			user1: 'juan',
			user2: 'john',
			status: FriendshipStatus.Active
		},
	]
}
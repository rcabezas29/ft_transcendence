import { reactive } from 'vue'
import type { Socket } from "socket.io-client";

interface IUser {
	token: String | null,
	socket: Socket | null
}

export const user = reactive<IUser>({
	token: null,
	socket: null
});


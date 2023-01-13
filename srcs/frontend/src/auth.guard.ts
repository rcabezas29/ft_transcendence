import { user } from "./user";

export async function authenticationGuard(to, from, next) {
	const validStorageToken = await user.checkLocalStorage();

	if (!validStorageToken)
		next({name: "login"});
	else next();
}


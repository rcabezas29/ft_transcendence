import { user } from "../user";

export async function authenticationGuard(to, from, next) {
	if (!await user.isLogged())
		next({name: "login"});
	else next();
}

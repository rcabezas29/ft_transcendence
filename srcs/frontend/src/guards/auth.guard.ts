import { user } from "../user";

export async function authenticationGuard(to, from, next) {
	if (!user.isLogged())
		next({name: "login"});
	else next();
}

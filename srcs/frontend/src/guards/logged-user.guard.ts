import { user } from "../user";

export async function loggedUserGuard(to, from, next) {
	if (user.isLogged())
		next({name: "home"});
	else next();
}

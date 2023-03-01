import { user } from "../user";

export async function loggedUserGuard(to, from, next) {
	if (await user.isLogged())
		next({name: "home"});
	else next();
}

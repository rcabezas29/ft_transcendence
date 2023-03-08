import { user } from "../user";

export async function loggedUserGuard(to, from, next) {
	if (user.checkIsLogged() && !user.hasSubmittedFirstTimeLoginForm())
		next({name: "first-login"});
	else if (user.checkIsLogged())
		next({name: "home"});
	else next();
}

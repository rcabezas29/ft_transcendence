import { user } from "../user";

export async function authenticationGuard(to, from, next) {
	if (!user.checkIsLogged())
		next({name: "login"});
	else if (user.hasSubmittedFirstTimeLoginForm() === false)
		next({name: "first-login"});
	else next();
}

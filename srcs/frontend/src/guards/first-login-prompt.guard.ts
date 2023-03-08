import { user } from "../user";

export async function firstLoginGuard(to, from, next) {
	if (!user.checkIsLogged())
		next({name: "login"});
	else if (user.hasSubmittedFirstTimeLoginForm() === true)
		next({name: "home"});
	else next();
}

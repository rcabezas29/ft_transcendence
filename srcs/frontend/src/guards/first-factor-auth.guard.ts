import { user } from "../user";

export async function firstFactorAuthenticationGuard(to, from, next) {
	if (!user.token)
		next({name: "login"});
    else if (user.checkIsLogged())
		next({name: "home"});
	else next();
}

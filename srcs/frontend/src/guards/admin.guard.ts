import { user } from "../user";

export async function adminGuard(to, from, next) {
	if (!user.isAdmin())
		next({name: "home"});
	else next();
}

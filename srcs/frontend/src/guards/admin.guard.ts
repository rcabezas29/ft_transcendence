import { user } from "../user";

export async function adminGuard(to, from, next) {
	if (!user.isWebsiteAdmin())
		next({name: "home"});
	else next();
}

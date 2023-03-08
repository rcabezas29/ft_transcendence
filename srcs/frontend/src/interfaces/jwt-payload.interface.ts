export interface JwtPayload {
    id: number;
	isSecondFactorAuthenticated: boolean;
	iat: number;
	exp: number;
}

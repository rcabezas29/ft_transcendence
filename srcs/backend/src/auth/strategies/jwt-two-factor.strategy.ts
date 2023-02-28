import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "src/users/entities/user.entity";
import { UsersService } from "src/users/users.service";
import { JwtPayload } from "../interfaces/jwt-payload.interface";

@Injectable()
export class JwtTwoFactorStrategy extends PassportStrategy(Strategy, 'jwt-two-factor') {
    constructor(private usersService: UsersService) {
        super({
            secretOrKey: process.env.JWT_SECRET || 'default_jwt_secret_value',
            ignoreExpiration: false,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        });
    }

    async validate(payload: JwtPayload): Promise<User> {
        const { id, isSecondFactorAuthenticated } = payload;

        const user = await this.usersService.findOneById(id);

        if (!user.isTwoFactorAuthenticationEnabled)
            return user;
        if (isSecondFactorAuthenticated)
            return user;
    }
}

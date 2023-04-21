import { CanActivate, ExecutionContext, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { Observable } from "rxjs";
import { User } from "src/users/entities/user.entity";
import { UsersService } from "src/users/users.service";
import { UserRole } from "src/users/interfaces/user-roles";

@Injectable()
export class OwnerGuard implements CanActivate {
    constructor(
        private readonly userService: UsersService
    ) {}
    
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (user && user.id) {
            return this.checkifUserIsOwner(user.id);
        }
        return false;
    }

    private async checkifUserIsOwner(userId: number): Promise<boolean> {
        const user: User = await this.userService.findOneById(userId);
        if (!user)
            throw new NotFoundException();

        if (user.role == UserRole.OWNER)
            return true;

        throw new UnauthorizedException('User must be owner');
    }
}

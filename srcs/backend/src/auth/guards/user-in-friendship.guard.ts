import { CanActivate, ExecutionContext, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { Observable } from "rxjs";
import { Friendship } from "src/friendships/entities/friendship.entity";
import { FriendshipsService } from "src/friendships/friendships.service";

@Injectable()
export class UserInFriendshipGuard implements CanActivate {
    constructor(
        private readonly friendshipService: FriendshipsService
    ) {}
    
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const params = request.params;

        if (user && user.id && params && params.id) {
            return this.checkIfUserInFriendship(user.id, params.id);
        }
        return false;
    }

    private async checkIfUserInFriendship(userId: number, friendshipId: number): Promise<boolean> {
        const friendship: Friendship = await this.friendshipService.findOneById(friendshipId);
        if (!friendship)
            throw new NotFoundException();

        if (userId == friendship.user1Id || userId == friendship.user2Id)
            return true;

        throw new UnauthorizedException('User must be member of friendship');
    }
}

import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import { Friendship } from "src/friends/entities/friendship.entity";
import { FriendsService } from "src/friends/friends.service";

@Injectable()
export class UserFriendGuard implements CanActivate {
    constructor(private readonly friendsService: FriendsService) {}
    
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        const body = request.body;
        const params = request.params;

        if (params && params.id) {
            return this.checkIfUserInFriendship(user.id, params.id);
        }
        else if (body && body.user1Id && body.user2Id) {
            return (user.id == body.user1Id || user.id == body.user2Id);
        }
        return false;
    }

    private async checkIfUserInFriendship(userId: number, friendshipId: number): Promise<boolean> {
        const friendship: Friendship = await this.friendsService.findOne(friendshipId);
        if (!friendship)
            return false;

        console.log(userId, friendship.user1Id, friendship.user2Id)
        if (userId == friendship.user1Id || userId == friendship.user2Id)
            return true;
        return false;
    }
}

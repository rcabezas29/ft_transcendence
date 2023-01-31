import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { GatewayManagerModule } from 'src/gateway-manager/gateway-manager.module';
import { UsersModule } from 'src/users/users.module';
import { MatchmakingService } from './matchmaking.service'

@Module({
	imports: [GatewayManagerModule, UsersModule],
  	providers: [GameService, GameGateway, MatchmakingService],
	exports: []
})
export class GameModule {}

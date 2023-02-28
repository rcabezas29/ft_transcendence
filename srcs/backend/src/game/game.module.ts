import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { GatewayManagerModule } from 'src/gateway-manager/gateway-manager.module';
import { UsersModule } from 'src/users/users.module';
import { MatchmakingService } from './matchmaking.service'
import { MatchHistoryService } from 'src/match-history/match-history.service';
import { MatchHistoryModule } from 'src/match-history/match-history.module';

@Module({
	imports: [GatewayManagerModule, UsersModule, MatchHistoryModule],
  	providers: [GameService, GameGateway, MatchmakingService, MatchHistoryService],
	exports: []
})
export class GameModule {}

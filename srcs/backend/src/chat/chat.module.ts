import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { GatewayManagerModule } from '../gateway-manager/gateway-manager.module';
import { ChannelsService } from './channels.service';
import { UserFriendshipsModule } from 'src/user-friendships/user-friendships.module';

@Module({
	imports: [GatewayManagerModule, UserFriendshipsModule],
	providers: [ChatService, ChatGateway, ChannelsService]
})
export class ChatModule {}

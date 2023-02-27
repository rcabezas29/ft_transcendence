import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { GatewayManagerModule } from '../gateway-manager/gateway-manager.module';
import { ChannelsService } from './channels.service';
import { FriendshipsModule } from 'src/friendships/friendships.module';

@Module({
	imports: [GatewayManagerModule, FriendshipsModule],
	providers: [ChatService, ChatGateway, ChannelsService]
})
export class ChatModule {}

import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { GatewayManagerModule } from '../gateway-manager/gateway-manager.module';
import { ChannelsService } from './channels.service';

@Module({
	imports: [GatewayManagerModule],
	providers: [ChatService, ChatGateway, ChannelsService]
})
export class ChatModule {}

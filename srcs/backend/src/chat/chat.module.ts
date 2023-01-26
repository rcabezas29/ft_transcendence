import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { GatewayManagerModule } from '../gateway-manager/gateway-manager.module';
import { ChannelsService } from './channels.service';

@Module({
	imports: [GatewayManagerModule],
	controllers: [ChatController],
	providers: [ChatService, ChatGateway, ChannelsService]
})
export class ChatModule {}

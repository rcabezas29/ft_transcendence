import { Module } from '@nestjs/common';
import { GatewayManagerService } from './gateway-manager.service';
import { GatewayManagerGateway } from './gateway-manager.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';

@Module({
	imports: [AuthModule, UsersModule],
	providers: [GatewayManagerService, GatewayManagerGateway],
	exports: [GatewayManagerService, GatewayManagerGateway]
})
export class GatewayManagerModule {}

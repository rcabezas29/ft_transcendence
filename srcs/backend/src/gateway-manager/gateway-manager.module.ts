import { Module } from '@nestjs/common';
import { GatewayManagerService } from './gateway-manager.service';
import { GatewayManagerGateway } from './gateway-manager.gateway';
import { AuthModule } from 'src/auth/auth.module';

@Module({
	imports: [AuthModule], 
	providers: [GatewayManagerService, GatewayManagerGateway],
	exports: [GatewayManagerService]
})
export class GatewayManagerModule {}

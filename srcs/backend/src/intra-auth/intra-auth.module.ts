import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { IntraAuthService } from './intra-auth.service';

@Module({
  providers: [IntraAuthService],
  exports: [IntraAuthService]
})
export class IntraAuthModule {}

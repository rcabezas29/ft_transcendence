import { Module } from '@nestjs/common';
import { FilesModule } from 'src/files/files.module';
import { IntraAuthService } from './intra-auth.service';

@Module({
  imports: [FilesModule],
  providers: [IntraAuthService],
  exports: [IntraAuthService]
})
export class IntraAuthModule {}

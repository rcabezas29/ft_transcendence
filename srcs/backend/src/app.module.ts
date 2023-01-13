import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
<<<<<<< HEAD
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [ChatModule],
=======
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'database',
      port: 5432,
      username: 'postgres',
      password: process.env.POSTGRES_PASSWORD,
      database: 'postgres',
      entities: [User],
      synchronize: true,
    }),
  ],
>>>>>>> develop
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

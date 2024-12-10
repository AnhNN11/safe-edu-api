import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// INNER
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchemaFactory } from './entities/user.entity';
import { UsersRepository } from '@repositories/users.repository';

// OUTER
import { UserRolesModule } from '@modules/user-roles/user-roles.module';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: User.name,
        useFactory: UserSchemaFactory,
      },
    ]),
    UserRolesModule, // Import UserRolesModule
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    { provide: 'UsersRepositoryInterface', useClass: UsersRepository },
  ],
  exports: [UsersService],
})
export class UsersModule {}

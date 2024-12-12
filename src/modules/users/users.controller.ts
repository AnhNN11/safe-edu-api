import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseInterceptors,
	UseGuards,
} from '@nestjs/common';
import {
	ApiTags,
	ApiBearerAuth,
	ApiOperation,
} from '@nestjs/swagger';
import MongooseClassSerializerInterceptor from 'src/interceptors/mongoose-class-serializer.interceptor';

// Inner imports
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

// Outer imports
import { JwtAccessTokenGuard } from '@modules/auth/guards/jwt-access-token.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { USER_ROLE } from '@modules/user-roles/entities/user-role.entity';

@Controller('users')
@ApiTags('users')
@UseInterceptors(MongooseClassSerializerInterceptor(User))
@ApiBearerAuth('token')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Post()
	@ApiOperation({ summary: 'Create a new user' })
	async create(@Body() createUserDto: CreateUserDto): Promise<User> {
		return await this.usersService.create(createUserDto);
	}

	@Get()
	@ApiOperation({ summary: 'Retrieve all users' })
	@Roles(USER_ROLE.USER)
	@UseGuards(JwtAccessTokenGuard, RolesGuard)
	async findAll(){
		return await this.usersService.findAll();
	}

	@Get(':id')
	@ApiOperation({ summary: 'Retrieve a user by ID' })
	async findOne(@Param('id') id: string): Promise<User> {
		return await this.usersService.getUserWithRole(id);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Update a user by ID' })
	async update(
		@Param('id') id: string,
		@Body() updateUserDto: UpdateUserDto,
	): Promise<User> {
		return await this.usersService.update(id, updateUserDto);
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Delete a user by ID' })
	@Roles(USER_ROLE.ADMIN)
	@UseGuards(JwtAccessTokenGuard, RolesGuard)
	async remove(@Param('id') id: string): Promise<void> {
		await this.usersService.remove(id);
	}

	
}

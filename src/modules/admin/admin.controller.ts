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


// Outer imports
import { JwtAccessTokenGuard } from '@modules/auth/guards/jwt-access-token.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Admin } from './entities/admin.entity';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Controller('admin')
@ApiTags('admin')
@UseInterceptors(MongooseClassSerializerInterceptor(Admin))
@ApiBearerAuth('token')
export class AdminController {
	constructor(private readonly adminService: AdminService) {}

	@Post()
	@ApiOperation({ summary: 'Create a new admin' })
	async create(@Body() createAdminDto: CreateAdminDto): Promise<Admin> {
		console.log('controller');
		return await this.adminService.create(createAdminDto);
	}

	@Get()
	async findAll(){
		return await this.adminService.findAll();
	}

	@Get(':id')
	@ApiOperation({ summary: 'Retrieve a admin by ID' })
	async findOne(@Param('id') id: string): Promise<Admin> {
		return await this.adminService.findOneByCondition({id});
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Update a admin by ID' })
	async update(
		@Param('id') id: string,
		@Body() updateAdminDto: UpdateAdminDto,
	): Promise<Admin> {
		return await this.adminService.update(id, updateAdminDto);
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Delete a user by ID' })
	@UseGuards(JwtAccessTokenGuard, RolesGuard)
	async remove(@Param('id') id: string): Promise<void> {
		await this.adminService.remove(id);
	}
}

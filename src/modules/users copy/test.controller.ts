import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseInterceptors,
	SerializeOptions,
	UseGuards,
	UploadedFiles,
	Query,
	ParseIntPipe,
	Req,
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiBody,
	ApiConsumes,
	ApiOperation,
	ApiQuery,
	ApiTags,
} from '@nestjs/swagger';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

// INNER
import { TestService } from './test.service';
import { CreateTestDto } from './dto/create-test.dto';

import MongooseClassSerializerInterceptor from 'src/interceptors/mongoose-class-serializer.interceptor';

// OUTER
import { JwtAccessTokenGuard } from '@modules/auth/guards/jwt-access-token.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { USER_ROLE } from '@modules/user-roles/entities/user-role.entity';
import { ApiDocsPagination } from 'src/decorators/swagger-form-data.decorator';
import { RequestWithUser } from 'src/types/requests.type';
import { QueryParams } from 'src/types/common.type';
import { Test } from './entities/test.entity';

@Controller('tests')
@ApiTags('tests')
// @ApiBearerAuth('token')
@UseInterceptors(MongooseClassSerializerInterceptor(Test))
export class TestController {
	constructor(private readonly users_service: TestService) {}

	@Post()
	create(@Body() create_user_dto: CreateTestDto) {
		console.log(create_user_dto);

		return this.users_service.create(create_user_dto);
	}

	@Get()
	@ApiQuery({ name: 'page', type: Number, required: true })
	@ApiQuery({ name: 'limit', type: Number, required: true })
	@ApiQuery({ name: 'sort', type: String, required: false })
	@ApiQuery({ name: 'filter', type: String, required: false })
	@ApiQuery({ name: 'globalFilter', type: String, required: false })
	async findAll(
		@Query('page', ParseIntPipe) page: number,
		@Query('limit', ParseIntPipe) limit: number,
		@Query('sort') sort?: string,
		@Query('filter') filter?: string,
		@Query('globalFilter') globalFilter?: string,
	) {
		const parsedSort = sort ? JSON.parse(sort) : [];
		const parsedFilter = filter ? JSON.parse(filter) : [];
		console.log(parsedSort, parsedFilter);
		const queryParams: QueryParams = {
			page,
			limit,
			sort: parsedSort,
			filter: parsedFilter,
			globalFilter: globalFilter ? { value: globalFilter } : undefined,
		};

		return await this.users_service.findAll(queryParams);
	}
}

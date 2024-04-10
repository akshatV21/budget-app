import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ProfilesService } from './profiles.service'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { AuthUser, HttpResponse } from 'src/utils/types'
import { CreateProfileDto } from './dtos/create-profile.dto'
import { User } from 'src/auth/decorators/user.decorator'
import { PaginationDto } from 'src/utils/dtos'
import { UpdateProfileDto } from './dtos/update-profile.dto'

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Post('create')
  @Auth()
  async httpCreateProfile(@Body() data: CreateProfileDto, @User() user: AuthUser): HttpResponse {
    const profile = await this.profilesService.create(data, user.id)
    return { success: true, message: 'Profile created successfully.', data: { profile } }
  }

  @Get('list')
  @Auth()
  async httpListProfiles(@Query() pagination: PaginationDto, @User() user: AuthUser): HttpResponse {
    const profiles = await this.profilesService.list(pagination, user.id)
    return { success: true, message: 'Profiles fetched successfully.', data: { profiles } }
  }

  @Put('update')
  @Auth()
  async httpUpdateProfile(@Body() data: UpdateProfileDto, @User() user: AuthUser): HttpResponse {
    await this.profilesService.update(data, user)
    return { success: true, message: 'Profile updated successfully.' }
  }

  @Delete('delete/:profileId')
  @Auth()
  async httpDeleteProfile(@Param('profileId') profileId: string, @User() user: AuthUser): HttpResponse {
    await this.profilesService.delete(profileId, user)
    return { success: true, message: 'Profile deleted successfully.' }
  }
}

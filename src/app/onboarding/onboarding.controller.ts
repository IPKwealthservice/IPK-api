import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post()
create(@Body() body: any) {
  return this.onboardingService.create(body);
}

@Get(':id')
findOne(@Param('id') id: string) {
  return this.onboardingService.findById(id);
}

@Patch(':id')
update(@Param('id') id: string, @Body() body: any) {
  return this.onboardingService.update(id, body);
}
}

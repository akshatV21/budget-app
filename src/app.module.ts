import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { DatabaseModule } from './database/database.module'
import { AuthModule } from './auth/auth.module'
import { ProfilesModule } from './profiles/profiles.module'
import { AccountsModule } from './accounts/accounts.module'
import { CardsModule } from './cards/cards.module'
import { TransactionsModule } from './transactions/transactions.module'
import { StatsModule } from './stats/stats.module'
import { EventEmitterModule } from '@nestjs/event-emitter'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot({ global: true, maxListeners: 100 }),
    DatabaseModule,
    AuthModule,
    ProfilesModule,
    AccountsModule,
    CardsModule,
    TransactionsModule,
    StatsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

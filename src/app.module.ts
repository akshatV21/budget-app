import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { DatabaseModule } from './database/database.module'
import { AuthModule } from './auth/auth.module'
import { ProfilesModule } from './profiles/profiles.module'
import { AccountsModule } from './accounts/accounts.module'
import { CardsModule } from './cards/cards.module'
import { TransactionsModule } from './transactions/transactions.module'
import { StatsModule } from './stats/stats.module'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { CacheModule, CacheStore } from '@nestjs/cache-manager'
import { redisStore } from 'cache-manager-redis-store'
import { LoansModule } from './loans/loans.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot({ global: true, maxListeners: 100 }),
    CacheModule.register({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => {
        const store = await redisStore({
          socket: {
            host: config.get('REDIS_HOST'),
            port: +config.get('REDIS_PORT'),
          },
          password: config.get('REDIS_PASSWORD'),
        })

        return {
          store: store as unknown as CacheStore,
          ttl: +config.get('REDIS_TTL'),
        }
      },
      inject: [ConfigService],
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    ProfilesModule,
    AccountsModule,
    CardsModule,
    TransactionsModule,
    StatsModule,
    LoansModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

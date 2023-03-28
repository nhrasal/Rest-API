import { Module } from "@nestjs/common";
import { MailerModule } from "@nestjs-modules/mailer";
import { ENV } from "src/ENV";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { join } from "path";

const {
  MAIL_HOST,
  MAIL_PORT,
  MAIL_USER,
  MAIL_PASSWORD,
  MAIL_FROM_ADDRESS,
  MAIL_FROM_NAME,
} = ENV;

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: MAIL_HOST,
        port: MAIL_PORT,
        secure: false,
        auth: {
          user: MAIL_USER,
          pass: MAIL_PASSWORD,
        },
      },
      template: {
        dir: join(__dirname, "../email-templates"),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
      defaults: {
        from: `${MAIL_FROM_NAME} <${MAIL_FROM_ADDRESS}>`,
      },
    }),
  ],
})
export class CustomMailerModule {}

import { MailerService } from "@nestjs-modules/mailer";
import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from "@nestjs/bull";
import { Job } from "bull";
import { ENV } from "src/ENV";
const { BASE_URL, API_PREFIX } = ENV;

@Processor("userQueue")
export class userQueueService {
  constructor(private readonly mailerService: MailerService) {}

  @OnQueueActive()
  async OnQueueActive(job: Job<{ data: any }>) {
    console.log(`${job.name} - job active now`);
  }

  @OnQueueCompleted()
  async OnQueueCompletedEvent(job: Job<{ data: any }>) {
    console.log(`${job.name} - job done`);
    await job.remove();
  }

  @OnQueueFailed()
  async OnQueueFailed(job: Job<{ data: any }>) {
    return job;
  }

  @Process("accountVerification")
  async accountVerification(job: Job<{ data: any }>) {
    const requestData: any = job.data;
    try {
      await this.mailerService.sendMail({
        to: `"${requestData?.firstName} ${requestData?.lastName}" <${requestData?.email}>`,
        // from: `"KuiperZ" <${MAIL_FROM_ADDRESS}>`,
        subject: "Account Verification :: KuiperZ",
        template: "account-verification",
        context: {
          userData: requestData,
          title: "Account Verification :: KuiperZ",
          link: `${BASE_URL}${API_PREFIX}/auth/public/email-verify?token=${requestData.token}`,
          bodyText:
            "please click on the following link to verify your account: ",
        },
      });
    } catch (err) {
      console.log(err);
    }
  }
  // Now you are a part of KuiperZ Community! Login in Now.
  @Process("accountVerificationComplete")
  async accountVerificationComplete(job: Job<{ data: any }>) {
    const requestData: any = job.data;
    try {
      await this.mailerService.sendMail({
        to: `"${requestData?.firstName} ${requestData?.lastName}" <${requestData?.email}>`,
        // from: `"KuiperZ" <${MAIL_FROM_ADDRESS}>`,
        subject: "Account Confirmation :: KuiperZ",
        template: "congratulation",
        context: {
          userData: requestData,
          title: "Account Confirmation :: KuiperZ",
          bodyText: "Now you are a part of KuiperZ Community! Login in Now ",
        },
      });
    } catch (err) {}
  }

  // Password reset otp verification email
  @Process("passwordResetRequestMail")
  async passwordResetRequestMail(job: Job<{ data: any }>) {
    const userData: any = job.data;

    try {
      await this.mailerService
        .sendMail({
          to: `"${userData?.firstName} ${userData?.lastName}" <${userData?.email}>`,
          from: `"KuiperZ" <${ENV.MAIL_FROM_ADDRESS}>`,
          subject: "Password reset verification  :: KuiperZ",
          template: "account-verification",
          context: {
            userData: userData,
            title: "Password reset verification  :: KuiperZ",
            link: `${BASE_URL}${API_PREFIX}/auth/public/password-verification?token=${userData.token}`,
            bodyText: "Please click on the following link to password reset:",
          },
        })
        .then((res) => {
          console.log(
            "🚀 ~ file: user.service.ts:85 ~ userQueueService ~ .then ~ res:",
            res
          );
        })
        .catch((err) => {
          console.log(
            "🚀 ~ file: user.service.ts:88 ~ userQueueService ~ passwordResetRequestMail ~ err:",
            err
          );
        });
    } catch (err) {}
  }

  @Process("passwordResetConfirmationMessage")
  async passwordResetConfirmationMessage(job: Job<{ data: any }>) {
    const userData: any = job.data;

    try {
      await this.mailerService
        .sendMail({
          to: `"${userData?.firstName} ${userData?.lastName}" <${userData?.email}>`,
          // from: `"KuiperZ" <${ENV.MAIL_FROM_ADDRESS}>`,
          subject: "Password Reset  :: KuiperZ",
          html: `<b>Dear User</b>
          <br />
          Your password has been reset. Please try to login and enjoying KuiperZ.
          <br/>
          Thank you.
          `,
        })
        .then((res) => {
          console.log("Password Reset notification");
        })
        .catch((err) => {
          this.failedJobProcess(job.attemptsMade, job.name, err, userData);
        });
    } catch (err) {}
  }

  private async failedJobProcess(
    attempts: number,
    jobName: string,
    error: any,
    payload: any
  ) {
    if (attempts !== 5) return;
    try {
      //   this.failedJob.add('failedJobStore', {
      //     queueName: 'userQueue',
      //     jobName: jobName,
      //     payload: payload,
      //     error: error,
      //   });
    } catch (err) {}
  }
}

export class ResetPasswordDto {
    id: string;
    email: string;
    resetToken: string;
    newPassword: string;
}
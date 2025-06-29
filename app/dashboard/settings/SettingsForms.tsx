"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { updatePassword, createStripeConnectAccount, getStripeLoginLink, deleteAccount, type ActionResult } from "./actions";
import { Loader2, ExternalLink, Shield, CreditCard, Trash2 } from "lucide-react";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const deleteAccountSchema = z.object({
  email: z.string().email("Invalid email address"),
  confirmation: z.literal("DELETE", {
    errorMap: () => ({ message: "You must type 'DELETE' to confirm" }),
  }),
});

type PasswordFormData = z.infer<typeof passwordSchema>;
type DeleteAccountFormData = z.infer<typeof deleteAccountSchema>;

interface SettingsFormsProps {
  userEmail: string;
  userRole: string;
  hasStripeAccount: boolean;
}

export function PasswordChangeForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ActionResult | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordFormData) => {
    setIsSubmitting(true);
    setResult(null);

    const formData = new FormData();
    formData.append("currentPassword", data.currentPassword);
    formData.append("newPassword", data.newPassword);
    formData.append("confirmPassword", data.confirmPassword);

    const result = await updatePassword(formData);
    setResult(result);
    setIsSubmitting(false);

    if (result.success) {
      reset();
    }
  };

  return (
    <Card className="bg-[--card-background] border-[--border-primary]">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-[--text-secondary]" />
          <CardTitle className="text-[--text-primary]">Change Password</CardTitle>
        </div>
        <CardDescription className="text-[--text-secondary]">
          Update your account password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-[--text-primary]">
              Current Password
            </Label>
            <Input
              id="currentPassword"
              type="password"
              {...register("currentPassword")}
              className="bg-[--input-background] border-[--border-primary] text-[--text-primary] placeholder:text-[--text-muted]"
            />
            {errors.currentPassword && (
              <p className="text-sm text-red-500">{errors.currentPassword.message}</p>
            )}
            {result?.errors?.currentPassword && (
              <p className="text-sm text-red-500">{result.errors.currentPassword[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-[--text-primary]">
              New Password
            </Label>
            <Input
              id="newPassword"
              type="password"
              {...register("newPassword")}
              className="bg-[--input-background] border-[--border-primary] text-[--text-primary] placeholder:text-[--text-muted]"
            />
            {errors.newPassword && (
              <p className="text-sm text-red-500">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-[--text-primary]">
              Confirm New Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword")}
              className="bg-[--input-background] border-[--border-primary] text-[--text-primary] placeholder:text-[--text-muted]"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          {result && (
            <div className={`p-3 rounded-md text-sm ${
              result.success 
                ? "bg-green-900/50 text-green-200 border border-green-800" 
                : "bg-red-900/50 text-red-200 border border-red-800"
            }`}>
              {result.message}
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[--primary] hover:bg-[--primary-hover] text-white"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

interface StripeSettingsProps {
  userRole: string;
  hasStripeAccount: boolean;
}

export function StripeSettings({ userRole, hasStripeAccount }: StripeSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ActionResult | null>(null);

  const handleConnectStripe = async () => {
    setIsLoading(true);
    setResult(null);
    
    const result = await createStripeConnectAccount();
    setResult(result);
    setIsLoading(false);
  };

  const handleStripeLogin = async () => {
    setIsLoading(true);
    setResult(null);
    
    const result = await getStripeLoginLink();
    if (result.success && result.loginUrl) {
      window.open(result.loginUrl, "_blank");
    } else {
      setResult(result);
    }
    setIsLoading(false);
  };

  if (userRole !== "PROFESSIONAL") {
    return null;
  }

  return (
    <Card className="bg-[--card-background] border-[--border-primary]">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-[--text-secondary]" />
          <CardTitle className="text-[--text-primary]">Payment Settings</CardTitle>
        </div>
        <CardDescription className="text-[--text-secondary]">
          Manage your Stripe account for receiving payments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasStripeAccount ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-900/50 border border-green-800 rounded-md">
              <div>
                <p className="text-sm font-medium text-green-200">Stripe Account Connected</p>
                <p className="text-xs text-green-300">You can receive payments from clients</p>
              </div>
            </div>
            
            <Button
              onClick={handleStripeLogin}
              disabled={isLoading}
              variant="outline"
              className="bg-transparent border-[--border-primary] text-[--text-primary] hover:bg-[--background-muted]"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <ExternalLink className="mr-2 h-4 w-4" />
              Access Stripe Dashboard
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-yellow-900/50 border border-yellow-800 rounded-md">
              <div>
                <p className="text-sm font-medium text-yellow-200">No Stripe Account</p>
                <p className="text-xs text-yellow-300">Connect Stripe to receive payments</p>
              </div>
            </div>
            
            <Button
              onClick={handleConnectStripe}
              disabled={isLoading}
              className="bg-[--primary] hover:bg-[--primary-hover] text-white"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Connect Stripe Account
            </Button>
          </div>
        )}

        {result && !result.success && (
          <div className="p-3 rounded-md text-sm bg-red-900/50 text-red-200 border border-red-800">
            {result.message}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface DeleteAccountFormProps {
  userEmail: string;
}

export function DeleteAccountForm({ userEmail }: DeleteAccountFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ActionResult | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DeleteAccountFormData>({
    resolver: zodResolver(deleteAccountSchema),
  });

  const onSubmit = async (data: DeleteAccountFormData) => {
    setIsSubmitting(true);
    setResult(null);

    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("confirmation", data.confirmation);

    const result = await deleteAccount(formData);
    setResult(result);
    setIsSubmitting(false);

    if (!result.success) {
      reset();
    }
  };

  return (
    <Card className="bg-[--card-background] border-red-800">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-red-500" />
          <CardTitle className="text-red-400">Delete Account</CardTitle>
        </div>
        <CardDescription className="text-[--text-secondary]">
          Permanently delete your account and all associated data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-red-900/50 border border-red-800 rounded-md">
            <h4 className="text-sm font-medium text-red-200 mb-2">Warning</h4>
            <ul className="text-xs text-red-300 space-y-1">
              <li>• This action cannot be undone</li>
              <li>• All your data will be permanently deleted</li>
              <li>• You cannot delete your account if you have active bookings</li>
              <li>• Your Stripe account will need to be closed separately</li>
            </ul>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[--card-background] border-[--border-primary]">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-[--text-primary]">
                  Are you absolutely sure?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-[--text-secondary]">
                  This action cannot be undone. Please enter your email address and type "DELETE" to confirm.
                </AlertDialogDescription>
              </AlertDialogHeader>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[--text-primary]">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={userEmail}
                    {...register("email")}
                    className="bg-[--input-background] border-[--border-primary] text-[--text-primary] placeholder:text-[--text-muted]"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                  {result?.errors?.email && (
                    <p className="text-sm text-red-500">{result.errors.email[0]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmation" className="text-[--text-primary]">
                    Type "DELETE" to confirm
                  </Label>
                  <Input
                    id="confirmation"
                    {...register("confirmation")}
                    className="bg-[--input-background] border-[--border-primary] text-[--text-primary] placeholder:text-[--text-muted]"
                  />
                  {errors.confirmation && (
                    <p className="text-sm text-red-500">{errors.confirmation.message}</p>
                  )}
                </div>

                {result && !result.success && (
                  <div className="p-3 rounded-md text-sm bg-red-900/50 text-red-200 border border-red-800">
                    {result.message}
                  </div>
                )}

                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-transparent border-[--border-primary] text-[--text-primary] hover:bg-[--background-muted]">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </form>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { App } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Controller } from "react-hook-form";
import { Button, Input } from "@/components/ui";
import { useAppForm } from "@/hooks/use-app-form";
import { login } from "@/features/auth/api";
import { loginSchema, type LoginFormData } from "@/features/auth/schemas";
import { useAuthStore } from "@/features/auth/store";
import styles from "./login-form.module.scss";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { message } = App.useApp();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useAppForm<typeof loginSchema>(loginSchema, {
    username: "",
    password: "",
  });

  const onSubmit = async (data: LoginFormData) => {
    setSubmitting(true);
    try {
      const token = await login({
        username: data.username,
        password: data.password,
      });

      const meRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1"}/auth/me`,
        {
          headers: { Authorization: `Bearer ${token.access_token}` },
        }
      );

      if (!meRes.ok) {
        throw new Error("Failed to load user profile.");
      }

      const user = await meRes.json();
      setAuth(token.access_token, user);

      const redirect = searchParams.get("from") ?? "/";
      router.replace(redirect);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Login failed. Please try again.";
      message.error(msg);
      setSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <Controller
        name="username"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            label="Username"
            placeholder="frontdesk"
            autoComplete="username"
            autoFocus
            required
            error={errors.username?.message}
          />
        )}
      />

      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <Input.Password
            {...field}
            label="Password"
            placeholder="Enter your password"
            autoComplete="current-password"
            required
            error={errors.password?.message}
          />
        )}
      />

      <Button
        variant="primary"
        htmlType="submit"
        block
        size="large"
        loading={submitting}
        className={styles.submit}
      >
        Sign in
      </Button>
    </form>
  );
}

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../store/useAuthStore';
import './Auth.css';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Login = () => {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = (values) => {
    login(values);
    navigate(from, { replace: true });
  };

  return (
    <main className="auth-page">
      <h1>Login</h1>
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
        <label>
          Email
          <input type="email" {...register('email')} />
          {errors.email ? <span className="error-text">{errors.email.message}</span> : null}
        </label>
        <label>
          Password
          <input type="password" {...register('password')} />
          {errors.password ? <span className="error-text">{errors.password.message}</span> : null}
        </label>
        <button type="submit">Sign In</button>
      </form>
      <div className="auth-links">
        <Link to="/signup">Create account</Link>
        <Link to="/forgot-password">Forgot password?</Link>
      </div>
    </main>
  );
};

export default Login;
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../store/useAuthStore';
import './Auth.css';

const signupSchema = z
  .object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const Signup = () => {
  const signup = useAuthStore((state) => state.signup);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signupSchema) });

  const onSubmit = (values) => {
    signup(values);
    navigate('/dashboard', { replace: true });
  };

  return (
    <main className="auth-page">
      <h1>Create Account</h1>
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
        <label>
          Full Name
          <input type="text" {...register('name')} />
          {errors.name ? <span className="error-text">{errors.name.message}</span> : null}
        </label>
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
        <label>
          Confirm Password
          <input type="password" {...register('confirmPassword')} />
          {errors.confirmPassword ? <span className="error-text">{errors.confirmPassword.message}</span> : null}
        </label>
        <button type="submit">Create Account</button>
      </form>
      <div className="auth-links">
        <Link to="/login">Already have an account?</Link>
      </div>
    </main>
  );
};

export default Signup;
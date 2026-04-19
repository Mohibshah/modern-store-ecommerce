import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import './Auth.css';

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

const ForgotPassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitSuccessful },
  } = useForm({ resolver: zodResolver(forgotSchema) });

  return (
    <main className="auth-page">
      <h1>Forgot Password</h1>
      <form className="auth-form" onSubmit={handleSubmit(() => undefined)}>
        <label>
          Email
          <input type="email" {...register('email')} />
          {errors.email ? <span className="error-text">{errors.email.message}</span> : null}
        </label>
        <button type="submit">Send Reset Link</button>
      </form>
      {isSubmitSuccessful ? <p>Reset email sent. Please check your inbox.</p> : null}
      <div className="auth-links">
        <Link to="/login">Back to login</Link>
      </div>
    </main>
  );
};

export default ForgotPassword;
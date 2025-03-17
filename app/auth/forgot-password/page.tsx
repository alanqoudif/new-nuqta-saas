'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState('');
  const { resetPassword, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!email) {
      setFormError('Por favor, ingresa tu dirección de correo electrónico');
      return;
    }

    try {
      await resetPassword(email);
    } catch (error) {
      console.error('Error al solicitar restablecimiento de contraseña:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4 py-12">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-secondary-900/20 via-gray-900/10 to-gray-950"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold gradient-text">Nuqta AI</h1>
          </Link>
          <p className="text-gray-400 mt-2">Recupera tu contraseña</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold mb-2">¿Olvidaste tu contraseña?</h2>
              <p className="text-gray-400 text-sm">
                Ingresa tu dirección de correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
              </p>
            </div>

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              icon={<FiMail />}
              required
            />

            {(formError || error) && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-500 text-sm">
                {formError || error}
              </div>
            )}

            <Button
              type="submit"
              variant="gradient"
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              <Link
                href="/auth/login"
                className="text-primary-400 hover:text-primary-300 transition-colors"
              >
                Volver a iniciar sesión
              </Link>
            </p>
          </div>
        </Card>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <FiArrowLeft className="mr-2" /> Volver al inicio
          </Link>
        </div>
      </motion.div>
    </div>
  );
} 
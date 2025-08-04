'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Key, Shield, Eye, EyeOff } from 'lucide-react';

type Stage = 'enter-email' | 'answer-questions' | 'reset-password';

export default function ResetPasswordPage() {
  const [stage, setStage] = useState<Stage>('enter-email');
  const [email, setEmail] = useState('');
  const [questions, setQuestions] = useState<{ question: string }[]>([]);
  const [answers, setAnswers] = useState<{ question: string, answer: string }[]>([]);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // This endpoint needs to be created to fetch questions for a user
      const response = await fetch(`/api/auth/get-security-questions?email=${email}`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions);
        setAnswers(data.questions.map((q: any) => ({ question: q.question, answer: '' })));
        setStage('answer-questions');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to find user.');
      }
    } catch (err) {
      setError('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswersSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-security-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, answers }),
      });

      if (response.ok) {
        setStage('reset-password');
      } else {
        const data = await response.json();
        setError(data.error || 'Verification failed.');
      }
    } catch (err) {
      setError('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // This endpoint needs to be created to finalize password reset
      const response = await fetch('/api/auth/reset-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });

      if (response.ok) {
        router.push('/login?reset=success');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to reset password.');
      }
    } catch (err) {
      setError('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (index: number, answer: string) => {
    const newAnswers = [...answers];
    newAnswers[index].answer = answer;
    setAnswers(newAnswers);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
          
          {stage === 'enter-email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <p className="text-muted-foreground text-sm text-center">Enter your email to begin the password reset process.</p>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input id="email" type="email" placeholder="Enter your email" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Loading...' : 'Continue'}</Button>
            </form>
          )}

          {stage === 'answer-questions' && (
            <form onSubmit={handleAnswersSubmit} className="space-y-4">
              <p className="text-muted-foreground text-sm text-center">Answer your security questions to verify your identity.</p>
              {answers.map((item, index) => (
                <div key={index} className="space-y-2">
                  <Label htmlFor={`answer-${index}`}>{item.question}</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input id={`answer-${index}`} type="text" placeholder="Your answer" className="pl-10" value={item.answer} onChange={(e) => handleAnswerChange(index, e.target.value)} required />
                  </div>
                </div>
              ))}
              <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Verifying...' : 'Verify Answers'}</Button>
            </form>
          )}

          {stage === 'reset-password' && (
            <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
              <p className="text-muted-foreground text-sm text-center">Enter your new password.</p>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input id="newPassword" type={showPassword ? 'text' : 'password'} placeholder="New Password" className="pl-10" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">{showPassword ? <EyeOff /> : <Eye />}</button>
              </div>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input id="confirmPassword" type={showPassword ? 'text' : 'password'} placeholder="Confirm New Password" className="pl-10" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Resetting...' : 'Reset Password'}</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
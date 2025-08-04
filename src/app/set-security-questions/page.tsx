'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Plus, Trash, ArrowLeft } from 'lucide-react';

export default function SetSecurityQuestionsPage() {
  const [questions, setQuestions] = useState([{ question: '', answer: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch('/api/auth/get-user-security-questions');
        if (response.ok) {
          const data = await response.json();
          if (data.securityQuestions && data.securityQuestions.length > 0) {
            setQuestions(data.securityQuestions.map((q: any) => ({ ...q, answer: '' })));
          }
        }
      } catch (error) {
        console.error('Failed to fetch security questions', error);
      }
    };

    fetchQuestions();
  }, []);

  const handleQuestionChange = (index: number, field: 'question' | 'answer', value: string) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    if (questions.length < 3) {
      setQuestions([...questions, { question: '', answer: '' }]);
    }
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      const newQuestions = questions.filter((_, i) => i !== index);
      setQuestions(newQuestions);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (questions.some(q => !q.question || !q.answer)) {
      setError('Please fill out all question and answer fields.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/security-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questions }),
      });

      if (response.ok) {
        setSuccess('Security questions set successfully! Redirecting...');
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to set security questions.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-500 p-3 rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Set Security Questions</CardTitle>
          <p className="text-muted-foreground">These will be used to recover your account if you forget your password.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}
            
            {questions.map((q, index) => (
              <div key={index} className="space-y-2 p-4 border rounded-lg relative">
                <Label htmlFor={`question-${index}`}>Question {index + 1}</Label>
                <Input
                  id={`question-${index}`}
                  type="text"
                  placeholder="e.g., What was your first pet's name?"
                  value={q.question}
                  onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                  required
                />
                <Label htmlFor={`answer-${index}`}>Answer</Label>
                <Input
                  id={`answer-${index}`}
                  type="password"
                  placeholder="Enter your answer"
                  value={q.answer}
                  onChange={(e) => handleQuestionChange(index, 'answer', e.target.value)}
                  required
                />
                {questions.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => removeQuestion(index)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}

            <div className="flex justify-between items-center">
              <Button type="button" variant="outline" onClick={addQuestion} disabled={questions.length >= 3}>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Security Questions'}
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center">
            <Button variant="link" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
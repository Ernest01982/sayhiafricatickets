import React, { useState } from 'react';
import { MessageSquare, Lock, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import { UserRole } from '../types';
import { signInAndGetRole } from '../services/supabaseClient';

interface LoginPageProps {
  onLogin: (role: UserRole) => void;
  onBack?: () => void;
  onNavigateToLegal: (doc: 'terms' | 'privacy') => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onBack, onNavigateToLegal }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.PROMOTER);

  // Initialize defaults based on role selection for convenience
  React.useEffect(() => {
    if (selectedRole === UserRole.ADMIN) {
        setEmail('admin@example.com');
    } else {
        setEmail('promoter@example.com');
    }
  }, [selectedRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { user, role, error } = await signInAndGetRole(
        email,
        password || 'password123',
        selectedRole
      );

      if (error) {
        const authError = error instanceof Error ? error : new Error(error.message || 'Authentication failed');
        throw authError;
      }

      if (!user) {
        throw new Error('Unable to sign in. Please try again.');
      }

      const finalRole = (role as UserRole) || selectedRole;
      onLogin(finalRole);
    } catch (err: any) {
      console.error("Login exception:", err);
      const message = err?.message || 'An unexpected error occurred.';
      alert(`Login failed: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
       {onBack && (
        <button 
          onClick={onBack} 
          className="absolute top-6 left-6 p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
       )}

      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-2xl mb-4 shadow-lg shadow-green-200">
            <MessageSquare className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back</h1>
        <p className="text-slate-500 mt-2">Sign in to manage your events and tickets</p>
      </div>

      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Role Selection (Visual Helper) */}
                <div className="p-1 bg-slate-100 rounded-lg flex mb-4">
                    <button
                        type="button"
                        onClick={() => setSelectedRole(UserRole.PROMOTER)}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all
                            ${selectedRole === UserRole.PROMOTER ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Promoter
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedRole(UserRole.ADMIN)}
                            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all
                            ${selectedRole === UserRole.ADMIN ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Admin
                    </button>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition-all"
                        placeholder="you@example.com"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                    <div className="relative">
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition-all"
                            placeholder="********"
                        />
                        <Lock className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
                    </div>
                </div>

                <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <>
                            Sign In
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </>
                    )}
                </button>

                <p className="text-xs text-slate-400 text-center">
                  By signing in, you agree to our <button type="button" onClick={() => onNavigateToLegal('terms')} className="underline hover:text-slate-600">Terms of Service</button> and <button type="button" onClick={() => onNavigateToLegal('privacy')} className="underline hover:text-slate-600">Privacy Policy (POPIA)</button>.
                </p>
            </form>
        </div>
        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
                Don't have an account? <button className="font-semibold text-green-600 hover:text-green-700">Sign up</button>
            </p>
        </div>
      </div>
    </div>
  );
};

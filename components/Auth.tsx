import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserType } from '../types';

const Auth: React.FC = () => {
  const [userType, setUserType] = useState<UserType>('student');
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // Student fields
  const [fullName, setFullName] = useState('');
  // Company fields
  const [companyName, setCompanyName] = useState('');
  const [siret, setSiret] = useState('');
  const [sector, setSector] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, register, companyLogin, companyRegister, adminLogin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate password confirmation for registration
    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      if (userType === 'admin') {
        await adminLogin(email, password);
      } else if (userType === 'student') {
        if (isLogin) {
          await login(email, password);
        } else {
          await register(email, password, fullName);
        }
      } else {
        if (isLogin) {
          await companyLogin(email, password);
        } else {
          await companyRegister({
            email,
            password,
            siret,
            name: companyName,
            sector: sector || undefined,
            website: website || undefined,
            location: location || undefined,
          });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const switchUserType = (type: UserType) => {
    setUserType(type);
    setError('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setCompanyName('');
    setSiret('');
    setSector('');
    setWebsite('');
    setLocation('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-white to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-2xl mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-800">InternMatch AI</h1>
            <p className="text-slate-500 mt-1">
              {isLogin ? 'Sign in to your account' : 'Create a new account'}
            </p>
          </div>

          {/* User Type Tabs */}
          <div className="flex mb-6 bg-slate-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => switchUserType('student')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                userType === 'student'
                  ? 'bg-white text-sky-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => switchUserType('company')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                userType === 'company'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Company
            </button>
            <button
              type="button"
              onClick={() => { switchUserType('admin'); setIsLogin(true); }}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                userType === 'admin'
                  ? 'bg-white text-amber-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Admin
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Student Registration Fields */}
            {userType === 'student' && !isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>
            )}

            {/* Company Registration Fields */}
            {userType === 'company' && !isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="Acme Inc."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    SIRET (14 digits)
                  </label>
                  <input
                    type="text"
                    value={siret}
                    onChange={(e) => setSiret(e.target.value.replace(/\D/g, '').slice(0, 14))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="12345678901234"
                    required
                    pattern="\d{14}"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Sector
                    </label>
                    <input
                      type="text"
                      value={sector}
                      onChange={(e) => setSector(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      placeholder="Tech, Finance..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      placeholder="Paris, France"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Website (optional)
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="https://example.com"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 outline-none transition-all ${
                  userType === 'student'
                    ? 'focus:ring-sky-500 focus:border-sky-500'
                    : userType === 'company'
                    ? 'focus:ring-indigo-500 focus:border-indigo-500'
                    : 'focus:ring-amber-500 focus:border-amber-500'
                }`}
                placeholder={userType === 'student' ? 'you@example.com' : userType === 'company' ? 'contact@company.com' : 'admin@internmatch.com'}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 outline-none transition-all ${
                  userType === 'student'
                    ? 'focus:ring-sky-500 focus:border-sky-500'
                    : userType === 'company'
                    ? 'focus:ring-indigo-500 focus:border-indigo-500'
                    : 'focus:ring-amber-500 focus:border-amber-500'
                }`}
                placeholder="••••••••"
                required
                minLength={8}
              />
            </div>

            {!isLogin && userType !== 'admin' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 outline-none transition-all ${
                    userType === 'student'
                      ? 'focus:ring-sky-500 focus:border-sky-500'
                      : 'focus:ring-indigo-500 focus:border-indigo-500'
                  } ${
                    confirmPassword && password !== confirmPassword
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : ''
                  }`}
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                userType === 'student'
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700'
                  : userType === 'company'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'
                  : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : isLogin ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {userType !== 'admin' && (
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className={`font-medium text-sm ${
                  userType === 'student'
                    ? 'text-sky-600 hover:text-sky-700'
                    : 'text-indigo-600 hover:text-indigo-700'
                }`}
              >
                {isLogin
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </button>
            </div>
          )}

          {userType === 'admin' && (
            <div className="mt-6 text-center">
              <p className="text-xs text-slate-400">
                Admin access only. Contact system administrator for credentials.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;

import { Navigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { authUser, isAuthLoading } = useAppContext();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#58CC02] animate-spin" />
          <p className="text-white/50 text-sm font-medium">Loading UdyamPath...</p>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

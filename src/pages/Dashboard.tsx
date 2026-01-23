import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function DashboardRedirect() {
  const { userData, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && userData) {
      if (userData.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/app', { replace: true });
      }
    }
  }, [userData, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  );
}
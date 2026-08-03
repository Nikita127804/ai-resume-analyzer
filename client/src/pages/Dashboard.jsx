import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'

function Dashboard() {
  const { user } = useAuth()
  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Welcome, {user?.name}</h1>
      <p className="text-gray-600">Your dashboard content will go here.</p>
    </Layout>
  )
}

export default Dashboard